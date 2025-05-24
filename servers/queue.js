const queue = [];
let processing = false;
const MAX_RETRIES = 3;

async function saveRecordedStep(step) {
  // const step = JSON.parse(msg.content.toString());
  const response = await fetch("http://localhost:3111/api/recordstep", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(step),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
}

export function enqueue(step, recorderConfig) {
  queue.push({ step, retries: 0 });
  processQueue(recorderConfig);
}

async function processQueue(recorderConfig) {
  if (processing) return;
  processing = true;

  while (queue.length > 0) {
    const { step, retries } = queue.shift();
    try {
      await saveRecordedStep(step); // your API call or disk writer
    } catch (err) {
      if (recorderConfig && recorderConfig.debug)
        console.error(
          `❌ Failed to process step (attempt ${retries + 1})`,
          err
        );
      if (retries < MAX_RETRIES) {
        queue.unshift({ step, retries: retries + 1 });
        await new Promise((r) => setTimeout(r, 200)); // optional backoff
      } else {
        if (recorderConfig && recorderConfig.debug)
          console.error("🚫 Dropping step after max retries:", step);
        // Optionally push to a failed array or file
      }
    }
  }

  processing = false;
}

export async function flushQueue() {
  while (processing || queue.length > 0) {
    await new Promise((r) => setTimeout(r, 50));
  }
}

// process.on("SIGINT", async () => {
//   console.log("\n🧹 Flushing queue before exit...");
//   await flushQueue();
//   process.exit(0);
// });
