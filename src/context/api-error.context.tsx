"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ApiErrorContextValue = {
  message: string | null;
  showError: (message: string) => void;
  clearError: () => void;
};

const ApiErrorContext = createContext<ApiErrorContextValue | undefined>(undefined);

export function ApiErrorProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showError = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  const clearError = useCallback(() => {
    setMessage(null);
  }, []);

  const value = useMemo(
    () => ({
      message,
      showError,
      clearError,
    }),
    [message, showError, clearError]
  );

  return (
    <ApiErrorContext.Provider value={value}>
      {children}

      {message && (
        <div className="fixed right-4 top-4 z-[1000] max-w-md rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-100 shadow-xl backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 text-red-100/90">{message}</p>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="rounded-md px-2 py-1 text-red-100/80 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </ApiErrorContext.Provider>
  );
}

export function useApiError() {
  const context = useContext(ApiErrorContext);
  if (!context) {
    throw new Error("useApiError must be used within ApiErrorProvider");
  }
  return context;
}