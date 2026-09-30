"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/auth.context";
import { ApiErrorProvider } from "@/context/api-error.context";
import { getQueryClient } from "@/lib/queryClient";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <AuthProvider>
        <ApiErrorProvider>{children}</ApiErrorProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
