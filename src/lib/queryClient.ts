"use client";

import { QueryClient } from "@tanstack/react-query";

let client: QueryClient | null = null;

export function getQueryClient() {
  if (!client) {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          // Reuse loaded data for 30s (e.g. between a project's tabs)
          // instead of fetching it again.
          staleTime: 30_000,
          // A failed request already shows the global error toast (lib/api.ts);
          // retrying would show it again.
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return client;
}
