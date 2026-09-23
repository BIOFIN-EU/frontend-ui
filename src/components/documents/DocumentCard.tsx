"use client";

import { useState } from "react";
import { workflowService } from "@/services/workflow.service";
import { formatDate } from "@/lib/format";
import { buttonBaseSm, buttonGhost } from "@/lib/ui";

export type DocumentCardDoc = {
  case_document_id: number;
  original_filename: string;
  size_bytes?: number | null;
  created_at?: string | null;
};

function formatFileSize(bytes?: number | null): string {
  if (bytes == null) return "";

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Shared between the pathway wizard's file step and the read-only project
// dashboard, so both surfaces show a document (and its download link) the
// same way instead of drifting apart.
export function DocumentCard({
  caseId,
  document,
}: {
  caseId: number | string;
  document: DocumentCardDoc;
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    setError("");
    setDownloading(true);

    try {
      const result = await workflowService.getDocumentDownloadUrl(
        caseId,
        document.case_document_id
      );
      window.open(result.download_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("get document download url failed", err);
      setError("Couldn't get a download link. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const meta = [formatFileSize(document.size_bytes), formatDate(document.created_at)]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">
          {document.original_filename}
        </p>
        {meta && <p className="mt-0.5 text-xs text-white/45">{meta}</p>}
        {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className={`shrink-0 disabled:cursor-not-allowed disabled:opacity-60 ${buttonBaseSm} ${buttonGhost}`}
      >
        {downloading ? "Loading..." : "Download"}
      </button>
    </div>
  );
}
