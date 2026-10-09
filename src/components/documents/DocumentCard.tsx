"use client";

import { useState } from "react";
import { Download, Eye, File, FileSpreadsheet, FileText, Image as ImageIcon } from "lucide-react";
import { workflowService } from "@/services/workflow.service";
import { formatDate } from "@/lib/format";
import { saveFile, viewerFor } from "@/lib/documents";
import { buttonClass } from "@/components/ui/Button";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import type { CaseDocument } from "@/types/case-document";

export type DocumentCardDoc = Pick<CaseDocument, "case_document_id" | "original_filename"> &
  Partial<Pick<CaseDocument, "size_bytes" | "created_at" | "content_type" | "viewable" | "notes">>;

function formatFileSize(bytes?: number | null): string {
  if (bytes == null) return "";

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name: string, contentType?: string | null) {
  const lower = name.toLowerCase();
  if (contentType?.startsWith("image/") || /\.(png|jpe?g)$/.test(lower)) return ImageIcon;
  if (/\.(xlsx|csv)$/.test(lower)) return FileSpreadsheet;
  if (contentType === "application/pdf" || /\.(pdf|docx)$/.test(lower)) return FileText;
  return File;
}

// Shared between the pathway wizard's file step and the read-only project
// dashboard, so both surfaces show a document (and its View / Download
// buttons) the same way instead of drifting apart.
export function DocumentCard({
  caseId,
  document,
}: {
  caseId: number | string;
  document: DocumentCardDoc;
}) {
  const [downloading, setDownloading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [error, setError] = useState("");
  // Both must agree: the API serves only PDFs and images inline.
  const canView = Boolean(document.viewable) && viewerFor(document.content_type) !== null;

  async function handleDownload() {
    setError("");
    setDownloading(true);

    try {
      const blob = await workflowService.getDocumentFile(caseId, document.case_document_id, "attachment");
      saveFile(blob, document.original_filename);
    } catch (err) {
      console.error("document download failed", err);
      setError("Couldn't download the file. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const meta = [formatFileSize(document.size_bytes), formatDate(document.created_at)]
    .filter(Boolean)
    .join(" · ");

  const Icon = fileIcon(document.original_filename, document.content_type);

  // Stacked (name, then the buttons) so it fits a half-width card: the name
  // wraps instead of being cut short.
  return (
    <div className="rounded-xl surface-card p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-400/15 text-accent-200">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="line-clamp-2 break-words text-sm font-medium text-fg"
            title={document.original_filename}
          >
            {document.original_filename}
          </p>
          {meta && <p className="mt-0.5 text-xs text-fg/50">{meta}</p>}
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-danger-300">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {canView && (
          <button
            type="button"
            onClick={() => setViewing(true)}
            className={`gap-1.5 ${buttonClass("primary", "sm")}`}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden />
            View
          </button>
        )}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className={`gap-1.5 disabled:cursor-not-allowed disabled:opacity-60 ${buttonClass("ghost", "sm")}`}
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          {downloading ? "Downloading…" : "Download"}
        </button>
      </div>

      {canView && (
        <DocumentViewer
          caseId={caseId}
          document={viewing ? document : null}
          onClose={() => setViewing(false)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
