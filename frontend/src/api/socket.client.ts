import { io, type Socket } from "socket.io-client";

import type { SocketEvent } from "@/types/socket.types";

import { apiClient } from "./api.client";

/**
 * One socket per tab. It authenticates with the httpOnly access_token cookie;
 * when the server rejects an expired token, the session is refreshed once
 * and the socket reconnects.
 */
class SocketClient {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket) return this.socket;

    const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ws`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionDelayMax: 10_000
    });
    socket.on("connect_error", async error => {
      // Middleware rejections don't auto-reconnect; refresh, then retry.
      if (error.message === "Unauthorized" && !socket.active) {
        if (await apiClient.refreshSession()) socket.connect();
      }
    });
    this.socket = socket;
    return socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  /** Rooms are joined at connection time, so membership changes reconnect. */
  reconnect() {
    this.disconnect();
    this.connect();
  }

  /** Subscribes and returns the unsubscribe function. */
  on<T>(
    event: SocketEvent | "connect" | "disconnect",
    handler: (payload: T) => void
  ) {
    const socket = this.connect();
    socket.on(event, handler as (...args: unknown[]) => void);
    return () => {
      socket.off(event, handler as (...args: unknown[]) => void);
    };
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketClient = new SocketClient();
