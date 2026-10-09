// Rules for files uploaded in a pathway's file steps, mirroring physical-api
// (app/services/document_files.py), which checks them again from the file's
// content. Checked here first so the user hears at once, not after uploading.

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const UPLOAD_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".docx", ".xlsx", ".csv"];

// For the file input's accept attribute.
export const UPLOAD_ACCEPT = UPLOAD_EXTENSIONS.join(",");

const UPLOAD_TYPES = "PDF, PNG, JPEG, Word (.docx), Excel (.xlsx) or CSV";

export const UPLOAD_HINT = `${UPLOAD_TYPES}, up to 20 MB.`;

/** Why this file can't be uploaded, or null if it can. */
export function uploadProblem(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!UPLOAD_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return `Upload a ${UPLOAD_TYPES} file.`;
  }
  if (file.size === 0) return "The file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) return "The file is larger than 20 MB.";
  return null;
}

// Only these are shown in the dashboard; anything else is downloaded. The
// viewer gives the file this type itself (never the server's), so an
// uploaded page or script can't run on the dashboard's origin.
const VIEWERS = {
  "application/pdf": "pdf",
  "image/png": "image",
  "image/jpeg": "image",
} as const;

export type ViewerKind = (typeof VIEWERS)[keyof typeof VIEWERS];

export function viewerFor(contentType: string | null | undefined): {
  kind: ViewerKind;
  type: keyof typeof VIEWERS;
} | null {
  if (!contentType || !(contentType in VIEWERS)) return null;
  const type = contentType as keyof typeof VIEWERS;
  return { kind: VIEWERS[type], type };
}

/** Save a downloaded file under its name. */
export function saveFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(new Blob([blob], { type: "application/octet-stream" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser time to start the download before the URL goes.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
