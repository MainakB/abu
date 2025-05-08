// useModeSocket.js
import { useEffect } from "react";

export function useModeSocket(onPause) {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8787");

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "mode" && data.mode === "pause") {
          onPause();
        }
      } catch {}
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
      socket.close();
    };
  }, []);
}
