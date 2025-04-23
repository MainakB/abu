import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8787 });
let clients = new Set();

let currentMode = "record";
let activeTabId = null;

wss.on("connection", function connection(ws) {
  clients.add(ws);
  console.log("🧩 Client connected");

  ws.send(JSON.stringify({ type: "mode", mode: currentMode }));
  if (activeTabId) {
    ws.send(JSON.stringify({ type: "set-active-tab", tabId: activeTabId }));
  }

  ws.on("message", function incoming(message) {
    try {
      const data = JSON.parse(message);
      console.log("🧩 Received data: ", data);

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
    } catch (err) {
      console.warn("⚠️ Invalid WS message:", message);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("❌ Client disconnected");
  });
});

console.log("🟢 WebSocket server running on ws://localhost:8787");
