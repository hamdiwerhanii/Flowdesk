"use client";

import { type ReactNode, useEffect } from "react";

import useAuthStore from "@/modules/auth/store/authStore";
import { useRouter } from "@/navigation";
import FullscreenLoader from "@/shared/components/FullscreenLoader";

import { SocketProvider } from "./SocketProvider";

/**
 * Client-side session check for authenticated areas. The proxy already
 * redirected anonymous visitors; this loads the user and opens the socket.
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const status = useAuthStore(s => s.status);
  const checkAuth = useAuthStore(s => s.checkAuth);
  const router = useRouter();

  useEffect(() => {
    if (status === "idle") void checkAuth();
    if (status === "unauthenticated") router.replace("/login");
  }, [status, checkAuth, router]);

  if (status !== "authenticated") return <FullscreenLoader />;
  return <SocketProvider>{children}</SocketProvider>;
}
