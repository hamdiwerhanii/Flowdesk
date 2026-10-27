"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState
} from "react";

import { socketClient } from "@/api/socket.client";

const SocketContext = createContext({ connected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const offConnect = socketClient.on("connect", () => setConnected(true));
    const offDisconnect = socketClient.on("disconnect", () =>
      setConnected(false)
    );
    return () => {
      offConnect();
      offDisconnect();
      socketClient.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocketStatus = () => useContext(SocketContext);
