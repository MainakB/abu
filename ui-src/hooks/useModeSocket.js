// useModeSocket.js
import { useEffect,useCallback } from "react";

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

export function useAttributeUpdater(setAttributes) {
  return useCallback(
    (index, field, value) => {
      setAttributes((prev) => {
        const newAttributes = [...prev];
        const updatedAttr = { ...newAttributes[index] };

        if (updatedAttr[field] === value) return prev;

        updatedAttr[field] = value;
        newAttributes[index] = updatedAttr;
        return newAttributes;
      });
    },
    [setAttributes]
  );
}
