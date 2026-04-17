"use client";

import { AuthProvider } from "@/context/auth.context";
import { ApiErrorProvider } from "@/context/api-error.context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>
    <ApiErrorProvider>
      {children}
    </ApiErrorProvider>
  </AuthProvider>;
}