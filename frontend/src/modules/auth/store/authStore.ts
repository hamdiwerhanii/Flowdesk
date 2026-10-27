import { create } from "zustand";

import { authApi } from "@/api/auth.api";
import { socketClient } from "@/api/socket.client";

import type { AuthStatus, AuthUser } from "../types/auth.types";

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  setUser: (user: AuthUser) => void;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clear: () => void;
  logout: () => Promise<void>;
};

const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  status: "idle",

  setUser: user => set({ user, status: "authenticated" }),

  checkAuth: async () => {
    if (get().status === "loading") return;
    set({ status: "loading" });
    try {
      const user = await authApi.me();
      set({ user, status: "authenticated" });
    } catch {
      set({ user: null, status: "unauthenticated" });
    }
  },

  refreshUser: async () => {
    const user = await authApi.me().catch(() => null);
    if (user) set({ user });
  },

  clear: () => {
    socketClient.disconnect();
    set({ user: null, status: "unauthenticated" });
  },

  logout: async () => {
    await authApi.logout().catch(() => undefined);
    get().clear();
  }
}));

export default useAuthStore;
