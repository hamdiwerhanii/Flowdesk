import { QueryClient } from "@tanstack/react-query";

import { isApiError } from "@/api/api.client";

/**
 * Sockets invalidate queries when data changes, so a short staleTime is
 * only a safety net for missed events (unlike `Infinity`, which would show
 * stale data forever if one event were lost).
 */
export const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) =>
          // Client errors won't succeed on retry.
          !(isApiError(error) && error.status < 500) && failureCount < 2
      },
      mutations: { retry: false }
    }
  });
