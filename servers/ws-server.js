import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8787 });
let clients = new Set();

let currentMode = "record";
let activeTabId = null;
const args = process.argv.slice(2); // ['--port', '3111']
const debugModeIndex = args.indexOf("--debugMode");
const debugMode =
  debugModeIndex !== -1 ? args[debugModeIndex + 1] === "true" : false;

wss.on("connection", function connection(ws) {
  clients.add(ws);
  if (debugMode) console.log("🧩 Client connected");

  ws.send(JSON.stringify({ type: "mode", mode: currentMode }));
  if (activeTabId) {
    ws.send(JSON.stringify({ type: "set-active-tab", tabId: activeTabId }));
  }

  ws.on("message", function incoming(message) {
    try {
      const data = JSON.parse(message);
      if (debugMode) console.log("🧩 Received data: ", data);

      if (data.type === "mode") {
        currentMode = data.mode;
        for (const client of clients) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "mode", mode: currentMode }));
          }
        }
      }

      if (data.type === "set-active-tab" && data.tabId) {
        activeTabId = data.tabId;

        // Broadcast new active tab to all clients
        for (const client of clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ type: "set-active-tab", tabId: activeTabId })
            );
          }
        }
      }

      if (data.type === "set-active-iframe") {
        for (const client of clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "iframe-detected",
                activeIFrame: data.value,
              })
            );
          }
        }
      }

      if (
        data.type === "page-load-recorder-state" &&
        data.state !== undefined
      ) {
        // Broadcast new active tab to all clients
        for (const client of clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "page-load-recorder-state",
                state: data.state,
              })
            );
          }
        }
      }
    } catch (err) {
      console.error(err);
      console.warn("⚠️ Invalid WS message:", message);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    if (debugMode) console.log("❌ Client disconnected");
  });
});

if (debugMode)
  console.log("🟢 WebSocket server running on ws://localhost:8787");
