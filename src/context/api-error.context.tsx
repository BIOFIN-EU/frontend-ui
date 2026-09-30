"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const AUTO_DISMISS_MS = 7000;
const MAX_TOASTS = 3;

type Toast = {
  id: number;
  title: string;
  message: string;
};

type ApiErrorContextValue = {
  // Most recent error message, kept for callers that read it directly.
  message: string | null;
  showError: (message: string, status?: number | null) => void;
  clearError: () => void;
};

const ApiErrorContext = createContext<ApiErrorContextValue | undefined>(undefined);

function titleForStatus(status: number | null | undefined): string {
  if (status === null) return "Connection problem";
  if (status === 403) return "You don't have access";
  if (status === 404) return "Not found";
  return "Something went wrong";
}

export function ApiErrorProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Mirror of `toasts` so showError can decide synchronously, keeping side
  // effects (ids, timers) out of state updaters (Strict Mode runs those twice).
  const toastsRef = useRef<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const commit = useCallback((next: Toast[]) => {
    toastsRef.current = next;
    setToasts(next);
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
      commit(toastsRef.current.filter((toast) => toast.id !== id));
    },
    [commit]
  );

  const showError = useCallback(
    (msg: string, status?: number | null) => {
      const title = titleForStatus(status);
      const current = toastsRef.current;

      // The same failure often fires from several requests at once
      // (e.g. every widget on a page); show it once.
      if (current.some((toast) => toast.title === title && toast.message === msg)) {
        return;
      }

      const id = nextId.current++;
      timers.current.set(id, setTimeout(() => dismiss(id), AUTO_DISMISS_MS));

      const next = [...current, { id, title, message: msg }];
      for (const dropped of next.slice(0, Math.max(0, next.length - MAX_TOASTS))) {
        clearTimeout(timers.current.get(dropped.id));
        timers.current.delete(dropped.id);
      }
      commit(next.slice(-MAX_TOASTS));
    },
    [commit, dismiss]
  );

  const clearError = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    commit([]);
  }, [commit]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const message = toasts.length > 0 ? toasts[toasts.length - 1].message : null;

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

      <div
        aria-live="assertive"
        className="pointer-events-none fixed right-4 top-4 z-[1000] flex w-[calc(100%-2rem)] max-w-md flex-col gap-3"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className="pointer-events-auto rounded-xl border border-danger-400/30 bg-danger-500/15 px-4 py-3 text-sm text-danger-100 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{toast.title}</p>
                <p className="mt-1 break-words text-danger-100/90">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className="rounded-md px-2 py-1 text-danger-100/80 hover:bg-fg/10 hover:text-fg"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
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
