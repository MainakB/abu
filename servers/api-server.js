import express, { response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import "dotenv/config";
import OpenAI from "openai";
import { Ollama } from "ollama";
import { json } from "stream/consumers";
import { parseLLMTestSteps } from "./llmTestStepParser.js";
import { callLLM } from "./callOpenAI.js";
import { mapData } from "./server-utils.js";
import { RecorderConfig } from "./RecorderConfig.js";

const app = express();
const PORT = 3111;

const args = process.argv.slice(2); // ['--port', '3111']
const debugModeIndex = args.indexOf("--debugMode");
const debugMode =
  debugModeIndex !== -1 ? args[debugModeIndex + 1] === "true" : false;

let liveActions = [];
const liveSteps = [];
let locIndex = 1;
let currentActiveTabId = null;
let recorderConfig = null;

const EXPORT_VAR_NAME = "abc";
const IMPORT_LINE = `import {Types} from '../index';`;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/api/health", (req, res) => {
  res.send("ok");
});

app.post("/api/recorder/config", (req, res) => {
  recorderConfig = new RecorderConfig(req.body);
  res.sendStatus(200);
});

app.get("/api/recorder/config", (req, res) => {
  if (!recorderConfig) return res.status(404).send("Config not set");
  res.json(recorderConfig);
});

app.post("/record", (req, res) => {
  if (recorderConfig && recorderConfig.debug)
    console.log("📩 Received action:", req.body);

  liveActions.push(req.body);
  const data = mapData(req.body, locIndex);
  locIndex = data[1] === locIndex ? locIndex : data[1];
  const dateValue = Date.now();
  // writeLiveToFile(req.body.step, "steps.json");
  writeLiveToFile(
    data[0].step,
    recorderConfig.featureFile || `steps_${dateValue}.feature`
  );
  if (data[0].aiStep) {
    writeLiveToFile(
      data[0].aiStep,
      recorderConfig.featureFile
        ? `ai_${recorderConfig.featureFile}`
        : `aiSteps_${dateValue}.feature`,
      true
    );
  }

  if (data[0].locator) {
    const locKey = Object.keys(data[0].locator)[0];
    writeLocatorObject(
      locKey,
      Object.values(data[0].locator)[0],
      recorderConfig.locatorFile || `locators_${dateValue}.ts`
    );
  }

  if (
    req.body.browserUrl &&
    typeof req.body.browserUrl === "string" &&
    req.body.browserUrl.startsWith("http")
  ) {
    const urlValue = req.body.browserUrl;
    const step = data[0].aiStep || data[0].step;

    const metadata = req.body;
    const key = `${urlValue}****${step}`;

    const keyValue = crypto.createHash("sha256").update(key).digest("hex");
    writeLiveToMetadataFile(keyValue, metadata);
  }

  res.sendStatus(200);
});

app.get("/record", (req, res) => {
  res.json(liveActions);
});

app.delete("/record", (req, res) => {
  liveActions = [];
  res.sendStatus(200);
});

app.post("/api/proxy", async (req, res) => {
  const { host, path, method, headers, body, expectedStatus } = req.body;

  try {
    const url = new URL(path, host).toString();
    const resp = await fetch(url, {
      method,
      headers,
      body: ["POST", "PUT", "PATCH"].includes(method) ? body : undefined,
    });

    const text = await resp.text();
    res.json({
      // ok: resp.ok,
      // status: resp.status,
      response: text,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/dbproxy", async (req, res) => {
  const { host, path, method, headers, body, expectedStatus } = req.body;

  try {
    const url = new URL(path, host).toString();
    const resp = await fetch(url, {
      method,
      headers,
      body: ["POST", "PUT", "PATCH"].includes(method) ? body : undefined,
    });

    const text = await resp.text();
    res.json({
      // ok: resp.ok,
      // status: resp.status,
      response: text,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/gptchat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid input text." });
  }

  try {
    const steps = await parseLLMTestSteps(prompt, callLLM);
    return res.json({ steps });
  } catch (err) {
    console.error("LLM parsing error:", err.message);
    return res.status(500).json({
      error: "Failed to parse steps from LLM.",
      detail: err.message,
    });
  }
});

app.post("/api/llamachat", async (req, res) => {
  try {
    const ollama = new Ollama({ host: "http://127.0.0.1:11434" });
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await ollama.generate({
      model: "gemma:2b",
      prompt,
      system: ENHANCED_BASE_PROMPT,
      format: json,
    });

    res.json({ response: response.response });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error: "Failed to process your request" });
  }
});

app.listen(PORT, () => {
  if (debugMode)
    console.log(`🟢 Recorder Store Server running at http://localhost:${PORT}`);
});

const getFilePath = (FILE_NAME, isLocatorFile) => {
  const basePath = recorderConfig.selectedSrcFolder
    ? path.join(recorderConfig.selectedSrcFolder, "recordings")
    : path.join(process.cwd(), "src", "recordings");
  const recordingsDir = path.join(
    basePath,
    isLocatorFile ? "locators" : "features"
  );
  // return path.join(process.cwd(), "recordings", FILE_NAME);
  const filePath = path.join(recordingsDir, FILE_NAME);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return filePath;
};

const writeLiveToFile = (action, fileName, ai) => {
  let output = "";

  const filePath = getFilePath(fileName, false);
  const tagName = recorderConfig.tagName || "@recordedTest";
  const featName = recorderConfig.featureName || "Recorded Test Feature";
  const scenarioName = recorderConfig.scenarioName || "Recorded Test Scenario";

  let existing = "";
  if (fs.existsSync(filePath)) {
    try {
      existing = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
      console.warn("⚠️ Failed to read existing file:", err);
    }
  } else {
    output = `${tagName}\nFeature: ${featName}\n\nScenario: ${scenarioName}\n`;
  }

  const updated = existing.trim() + "\n" + action + "\n";

  fs.writeFileSync(filePath, output + updated);
};

const writeLocatorObject = (locatorId, locatorBlock, fileName) => {
  const filePath = getFilePath(fileName, true);
  // const dir = path.dirname(filePath);
  // if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let locators = {};
  let existing = "";

  if (fs.existsSync(filePath)) {
    existing = fs.readFileSync(filePath, "utf-8");

    const match = existing.match(
      /export const \w+: [\w.]+ = ({[\s\S]*?});?\s*$/
    );

    if (match) {
      let code = match[1]
        .replace(/__fileName/g, '"__fileName"')
        .replace(
          /Types\.LocatorTypes\.(\w+)/g,
          '"__ENUM__Types.LocatorTypes.$1"'
        );

      try {
        locators = eval(`(${code})`);
      } catch (err) {
        console.error("⚠️ Failed to eval locator object:", err);
      }
    }
  }

  // Update locator
  locators[locatorId] = locatorBlock;

  // Turn into formatted string
  let objectStr = JSON.stringify(locators, null, 2)
    .replace(/"__fileName"/g, "__fileName")
    .replace(/"__ENUM__(Types\.[\w.]+)"/g, "$1");
  // .replace(/"ENUM__(Types\.[\w.]+)"/g, "$1");

  // Output the final .ts content
  const output = `${IMPORT_LINE}

export const ${EXPORT_VAR_NAME}: Types.ILocatorMetadataObject = ${objectStr};
`;

  fs.writeFileSync(filePath, output);
  if (recorderConfig && recorderConfig.debug)
    console.log(`✅ Locator "${locatorId}" written to ${fileName}`);
};

const getMetadataFilePath = () => {
  const recordingsDir = path.join(process.cwd(), ".recording_metadata");
  // return path.join(process.cwd(), "recordings", FILE_NAME);
  const filePath = path.join(recordingsDir, "recording_metadata.json");
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return filePath;
};

const writeLiveToMetadataFile = (key, metaObj) => {
  const filePath = getMetadataFilePath();

  let output = null;
  if (fs.existsSync(filePath)) {
    try {
      const fileData = fs.readFileSync(filePath, "utf-8");
      output = JSON.parse(fileData);
    } catch (err) {
      console.warn("⚠️ Failed to read existing file:", err);
    }
  }

  const updated = output ? { ...output, [key]: metaObj } : { [key]: metaObj };

  fs.writeFileSync(filePath, JSON.stringify(updated));
};
