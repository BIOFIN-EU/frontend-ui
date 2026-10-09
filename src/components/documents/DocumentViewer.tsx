"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { workflowService } from "@/services/workflow.service";
import { buttonClass } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { viewerFor } from "@/lib/documents";

type ViewerDocument = {
  case_document_id: number;
  original_filename: string;
  content_type?: string | null;
};

type Props = {
  caseId: number | string;
  document: ViewerDocument | null;
  onClose: () => void;
  onDownload: () => void;
};

/**
 * Shows a PDF or image over the page. The file is fetched through the API
 * with the user's login (their access is checked and the view recorded),
 * then shown from a temporary local URL that's released on close.
 */
export function DocumentViewer({ caseId, document, onClose, onDownload }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const viewer = viewerFor(document?.content_type);

  useEffect(() => {
    if (!document || !viewer) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    setUrl(null);
    setError("");

    workflowService
      .getDocumentFile(caseId, document.case_document_id, "inline")
      .then((blob) => {
        if (cancelled) return;
        // The type comes from the allowed list, never from the response.
        objectUrl = URL.createObjectURL(new Blob([blob], { type: viewer.type }));
        setUrl(objectUrl);
      })
      .catch((err) => {
        console.error("load document failed", err);
        if (!cancelled) setError("Couldn't open the file. Please try again, or download it.");
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // viewer.type follows document.content_type.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, document?.case_document_id, viewer?.type]);

  return (
    <Dialog open={document !== null} onClose={onClose} initialFocus={closeRef} className="relative z-[900]">
      <DialogBackdrop className="fixed inset-0 bg-shade/70 backdrop-blur-sm" />

      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-6">
        <DialogPanel className="flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-fg/10 bg-dialog text-fg shadow-overlay">
          <div className="flex items-center justify-between gap-3 border-b border-fg/10 px-4 py-3">
            <DialogTitle className="min-w-0 truncate text-sm font-semibold">
              {document?.original_filename}
            </DialogTitle>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={onDownload} className={buttonClass("ghost", "sm")}>
                Download
              </button>
              <button ref={closeRef} type="button" onClick={onClose} className={buttonClass("ghost", "sm")}>
                Close
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 bg-shade/30">
            {error ? (
              <div className="p-4">
                <Alert tone="danger" as="p">{error}</Alert>
              </div>
            ) : !url ? (
              <p className="p-4 text-sm text-fg/60">Loading…</p>
            ) : viewer?.kind === "pdf" ? (
              <iframe src={url} title={document?.original_filename} className="h-full w-full border-0" />
            ) : (
              <div className="flex h-full items-center justify-center overflow-auto p-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- a local blob, not an optimisable image */}
                <img src={url} alt={document?.original_filename ?? ""} className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>

          {viewer?.kind === "pdf" && url && (
            <p className="border-t border-fg/10 px-4 py-2 text-xs text-fg/50 sm:hidden">
              If the document doesn&apos;t show on your phone, download it instead.
            </p>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
