"use client";

import { useRef, useState, type ReactNode } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { buttonClass } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type Props = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busyLabel?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
};

/**
 * Confirmation for a destructive action. Cancel has initial focus so Enter
 * never confirms by accident; while onConfirm runs, both buttons are disabled
 * and the dialog can't be dismissed. An error from onConfirm is shown inline.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  busyLabel = "Working…",
  onConfirm,
  onClose,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    if (busy) return;
    setError(null);
    onClose();
  }

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={close} initialFocus={cancelRef} className="relative z-[900]">
      <DialogBackdrop className="fixed inset-0 bg-shade/60 backdrop-blur-sm" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-2xl border border-fg/10 bg-dialog p-6 text-fg shadow-overlay">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>

          <div className="mt-3 space-y-2 text-sm leading-6 text-fg/75">{children}</div>

          {error && (
            <Alert tone="danger" as="p" className="mt-4">
              {error}
            </Alert>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              ref={cancelRef}
              type="button"
              onClick={close}
              disabled={busy}
              className={`${buttonClass("ghost")} disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className={`${buttonClass("danger")} disabled:opacity-60`}
            >
              {busy ? busyLabel : confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
