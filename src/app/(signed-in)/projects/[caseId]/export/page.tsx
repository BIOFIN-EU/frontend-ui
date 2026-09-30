"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Download, FileCode2, FileJson, Network, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { semanticService } from "@/services/semantic.service";
import { buttonClass } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

// The files a user can download for a project. To add one, add an entry:
// a title, a short description and its files (each with a fetch that returns
// the file's content). An entry without files is shown as "coming soon".
type DownloadFile = {
  label: string;
  filename: (caseId: string) => string;
  mimeType: string;
  fetch: (caseId: string) => Promise<unknown>;
};

type DownloadEntry = {
  key: string;
  title: string;
  format: string;
  icon: LucideIcon;
  description: string;
  files?: DownloadFile[];
};

// The BIOFIN-EU ontology, from its public repository.
const ONTOLOGY_URL = "https://raw.githubusercontent.com/BIOFIN-EU/ontology/main/biofineu.ttl";
const ONTOLOGY_REPOSITORY = "https://github.com/BIOFIN-EU/ontology";

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download the file (${response.status}).`);
  return response.text();
}

const DOWNLOADS: DownloadEntry[] = [
  {
    key: "project-jsonld",
    title: "Project data",
    format: "JSON-LD",
    icon: FileJson,
    description:
      "Project data structured using the BIOFIN-EU ontology, making it easier for partners and linked-data tools to access, interpret and reuse. Contact details and other personal data are excluded.",
    files: [
      {
        label: "Download JSON-LD",
        filename: (caseId) => `biofin-project-${caseId}.jsonld`,
        mimeType: "application/ld+json",
        fetch: (caseId) => semanticService.exportProject(caseId),
      },
    ],
  },
  {
    key: "ontology",
    title: "BIOFIN-EU ontology",
    format: "Turtle (RDF)",
    icon: Network,
    description:
      "The BIOFIN-EU ontology provides a shared vocabulary for describing project data, including nature-based solutions, financial products, participating organisations and their roles, risk assessments, monitoring, classifications and funding requirements.",
    files: [
      {
        label: "BIOFIN-EU ontology",
        filename: () => "biofineu.ttl",
        mimeType: "text/turtle",
        fetch: () => fetchText(ONTOLOGY_URL),
      }
    ],
  },
  {
    key: "future",
    title: "More downloads",
    format: "Coming soon",
    icon: Plus,
    description: "Further files for this project, such as reports and selected parts of its data, will appear here.",
  },
];

function saveFile(content: unknown, filename: string, mimeType: string) {
  const text = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ProjectExportPage() {
  const { caseId } = useParams<{ caseId: string }>();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-fg">Export</h2>
        <p className="max-w-3xl text-sm leading-6 text-fg/65">Files you can download for this project.</p>
      </div>

      <ul className="grid gap-4 lg:grid-cols-2">
        {DOWNLOADS.map((entry) => (
          <DownloadCard key={entry.key} entry={entry} caseId={caseId} />
        ))}
      </ul>
    </div>
  );
}

function DownloadCard({ entry, caseId }: { entry: DownloadEntry; caseId: string }) {
  const Icon = entry.icon;
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const comingSoon = !entry.files?.length;

  async function download(file: DownloadFile) {
    setBusy(file.label);
    setError("");
    try {
      saveFile(await file.fetch(caseId), file.filename(caseId), file.mimeType);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The file could not be downloaded.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <li
      className={`flex flex-col rounded-2xl p-6 ${
        comingSoon ? "border border-dashed border-fg/15 bg-fg/[0.02]" : "surface-panel shadow-panel"
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${comingSoon ? "text-fg/40" : "text-accent-300"}`} aria-hidden="true" />
        <div>
          <h3 className={`text-base font-semibold ${comingSoon ? "text-fg/60" : "text-fg"}`}>{entry.title}</h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-fg/45">{entry.format}</p>
        </div>
      </div>

      <p className={`mt-3 text-sm leading-6 ${comingSoon ? "text-fg/50" : "text-fg/65"}`}>{entry.description}</p>
      {entry.key === "ontology" && (
        <p className="mt-2 text-sm text-fg/55">
          Source:{" "}
          <a href={ONTOLOGY_REPOSITORY} target="_blank" rel="noopener noreferrer" className="!text-accent-200 hover:!text-accent-100">
            github.com/BIOFIN-EU/ontology
          </a>
        </p>
      )}

      {!comingSoon && (
        <div className="mt-auto flex flex-wrap gap-3 pt-5">
          {entry.files!.map((file, index) => (
            <button
              key={file.label}
              type="button"
              onClick={() => download(file)}
              disabled={busy !== null}
              className={`${buttonClass(index === 0 ? "primary" : "secondary", "sm")} gap-2`}
            >
              {index === 0 ? <Download className="h-4 w-4" aria-hidden="true" /> : <FileCode2 className="h-4 w-4" aria-hidden="true" />}
              {busy === file.label ? "Preparing…" : file.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <Alert tone="danger" className="mt-4">
          {error}
        </Alert>
      )}
    </li>
  );
}
