import express from "express";
import fs from "fs";
import path from "path";
import { mapData } from "./server-utils.js";

const app = express();
const PORT = 3111;

let liveActions = [];
const liveSteps = [];
let locIndex = 1;
let currentActiveTabId = null;

const EXPORT_VAR_NAME = "abc";
const IMPORT_LINE = `import {Types} from '../index';`;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.post("/record", (req, res) => {
  console.log("📩 Received action:", req.body);
  liveActions.push(req.body);
  const data = mapData(req.body, locIndex);
  locIndex = data[1] === locIndex ? locIndex : data[1];
  // writeLiveToFile(req.body.step, "steps.json");
  writeLiveToFile(data[0].step, "steps.feature");
  if (data[0].aiStep) {
    writeLiveToFile(data[0].aiStep, "aiSteps.feature", true);
  }
  if (data[0].locator) {
    const locKey = Object.keys(data[0].locator)[0];
    writeLocatorObject(
      locKey,
      Object.values(data[0].locator)[0],
      "locators.ts"
    );
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

app.listen(PORT, () => {
  console.log(`🟢 Recorder Store Server running at http://localhost:${PORT}`);
});

const writeLiveToFile = (action, fileName, ai) => {
  const basePath = process.cwd();
  const recordingsDir = path.join(basePath, "recordings");
  const filePath = path.join(recordingsDir, fileName);
  let output = "";
  // Ensure the directory exists
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }

  let existing = "";
  if (fs.existsSync(filePath)) {
    try {
      existing = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
      console.warn("⚠️ Failed to read existing file:", err);
    }
  } else {
    output = `@recordedTest\nFeature: Recorded Test Feature\n\nScenario: Recorded Test Scenario\n`;
  }

  const updated = existing.trim() + "\n" + action + "\n";

  fs.writeFileSync(filePath, output + updated);
};

const getFilePath = (FILE_NAME) =>
  path.join(process.cwd(), "recordings", FILE_NAME);

// const writeLocatorObject = (locatorId, locatorBlock, fileName) => {
//   const filePath = getFilePath(fileName);

//   // Step 1: Ensure directory exists
//   const dir = path.dirname(filePath);
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

//   let locators = {};
//   let existing = "";

//   if (fs.existsSync(filePath)) {
//     existing = fs.readFileSync(filePath, "utf-8");

//     // Step 2: Extract the existing JSON object using regex
//     const match = existing.match(/export const \w+: [\w.]+ = ({[\s\S]*});?/);

//     if (match) {
//       try {
//         locators = eval(
//           `(${match[1]
//             .replace(/__fileName/g, '"__fileName"')
//             .replace(
//               /Types\.LocatorTypes\.(\w+)/g,
//               "__ENUM__Types.LocatorTypes.$1"
//             )})`
//         );
//       } catch (err) {
//         console.error("⚠️ Failed to parse existing locator object:", err);
//       }
//     }
//   }

//   // Step 3: Add or update the locator
//   locators[locatorId] = locatorBlock;

//   // Stringify and unquote "__fileName"
//   let objectStr = JSON.stringify(locators, null, 2);
//   objectStr = objectStr
//     .replace(/"__fileName"/g, "__fileName")
//     .replace(/"__ENUM__(Types\.[\w.]+)"/g, "$1");

//   // Step 4: Rebuild the .ts content
//   const output = `${IMPORT_LINE}

// export const ${EXPORT_VAR_NAME}: Types.ILocatorMetadataObject = ${objectStr};
// `;

//   fs.writeFileSync(filePath, output);
//   console.log(`✅ Locator "${locatorId}" written to ${fileName}`);
// };

const writeLocatorObject = (locatorId, locatorBlock, fileName) => {
  const filePath = getFilePath(fileName);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

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
  console.log(`✅ Locator "${locatorId}" written to ${fileName}`);
};
