import { QueryClient } from "@tanstack/react-query";

import { isApiError } from "@/api/api.client";

export const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) =>
          !(isApiError(error) && error.status < 500) && failureCount < 2
      },
      mutations: { retry: false }
    }
  });
