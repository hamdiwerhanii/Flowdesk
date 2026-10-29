"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";

import { apiClient } from "@/api/api.client";
import useAuthStore from "@/modules/auth/store/authStore";

import { makeQueryClient } from "./queryClient";
import { currentLocale } from "./utils";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  useEffect(() => {
    apiClient.onSessionExpired(() => {
      useAuthStore.getState().clear();
      queryClient.clear();
      window.location.href = `/${currentLocale()}/login`;
    });
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion='user'>{children}</MotionConfig>
      <Toaster
        position='top-right'
        theme='light'
        toastOptions={{
          classNames: {
            toast:
              "rounded-2xl! border-border! shadow-lift! font-sans! bg-card!",
            success: "text-primary!",
            error: "text-danger!"
          }
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
