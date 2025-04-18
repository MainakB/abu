import express from "express";

const app = express();
const PORT = 3111;

let liveActions = [];
let currentActiveTabId = null;

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
