"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import type { CaseListItem } from "@/types/case-list";
import { Select } from "@/components/ui/Select";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { buttonClass } from "@/components/ui/Button";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";

type Props = {
  cases: CaseListItem[];
  onDeleted?: (caseId: number) => void;
};

function safeLower(value: unknown) {
  return typeof value === "string" ? value.toLowerCase() : "";
}

function statusTone(status: string): BadgeTone {
  switch (safeLower(status)) {
    case "draft":
      return "warning";
    case "completed":
      return "success";
    case "submitted":
      return "info";
    case "in_progress":
      return "violet";
    default:
      return "neutral";
  }
}

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export function ProjectListScreen({ cases, onDeleted }: Props) {
  const [pendingDelete, setPendingDelete] = useState<CaseListItem | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const caseTypeOptions = useMemo(() => {
    const byCode = new Map<string, string>();

    cases.forEach((item) => {
      if (!item.caseType) return;
      if (!byCode.has(item.caseType)) {
        byCode.set(item.caseType, item.caseTypeName || item.caseType);
      }
    });

    return Array.from(byCode.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cases]);

  const statuses = useMemo(
    () =>
      Array.from(
        new Set(
          cases
            .map((item) => item.status)
            .filter((status): status is string => Boolean(status))
        )
      ).sort(),
    [cases]
  );

  const filteredCases = useMemo(() => {
    const q = query.trim().toLowerCase();

    return cases
      .filter((item) => {
        if (typeFilter !== "all" && item.caseType !== typeFilter) {
          return false;
        }

        if (statusFilter !== "all" && item.status !== statusFilter) {
          return false;
        }

        if (!q) return true;

        return (
          String(item.caseId ?? "").includes(q) ||
          safeLower(item.name).includes(q) ||
          safeLower(item.caseType).includes(q) ||
          safeLower(item.status).includes(q) ||
          safeLower(item.createdBy).includes(q) ||
          safeLower(item.updatedBy).includes(q) ||
          safeLower(item.description).includes(q)
        );
      })
      .sort((a, b) => b.caseId - a.caseId);
  }, [cases, query, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-fg/10 bg-gradient-to-br from-fg/[0.08] to-fg/[0.03] p-4 sm:p-6 shadow-panel backdrop-blur-xl">
        <PageHeader
          eyebrow="Projects"
          title="Project dashboard"
          subtitle="Browse, filter, and open your projects from one place."
          actions={
            <Link href="/pathways" className={buttonClass("primary")}>
              Create New Project
            </Link>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-fg/8 bg-shade/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg/45">
              Total projects
            </p>

            <p className="mt-3 text-3xl font-semibold text-fg">
              {cases.length}
            </p>
          </div>

          <div className="rounded-2xl border border-fg/8 bg-shade/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg/45">
              Project types
            </p>

            <p className="mt-3 text-3xl font-semibold text-fg">
              {caseTypeOptions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-fg/8 bg-shade/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg/45">
              Statuses
            </p>

            <p className="mt-3 text-3xl font-semibold text-fg">
              {statuses.length}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl surface-panel p-4 sm:p-6 shadow-panel-soft backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm text-fg/50">
            Filter projects
          </p>

          <div className="inline-flex items-center rounded-full border border-accent-400/20 bg-accent-500/10 px-3 py-1.5 text-xs font-semibold text-accent-200">
            {filteredCases.length} visible
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.5fr_0.85fr_0.85fr]">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-fg/45">
              Search
            </label>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by case id, name, type, status..."
              className="w-full rounded-2xl surface-card px-4 py-3 text-sm text-fg outline-none transition placeholder:text-fg/30 focus:border-accent-400/30 focus:bg-shade/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-fg/45">
              Project type
            </label>

            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                {
                  label: "All",
                  value: "all",
                },
                ...caseTypeOptions.map(({ code, name }) => ({
                  label: name,
                  value: code,
                })),
              ]}
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-fg/45">
              Status
            </label>

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                {
                  label: "All",
                  value: "all",
                },
                ...statuses.map((s) => ({
                  label: formatStatusLabel(s),
                  value: s,
                })),
              ]}
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl surface-panel shadow-panel-soft backdrop-blur-xl">
        {filteredCases.length === 0 ? (
          <div className="p-8 text-sm text-fg/60">No projects found.</div>
        ) : (
          <div className="divide-y divide-fg/8">
            {filteredCases.map((item) => (
              <div
                key={item.caseId}
                className="group flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition hover:bg-fg/[0.04]"
              >
                {/* Fixed width + tabular digits keep every column aligned whatever the ID length. */}
                <span className="inline-flex w-16 shrink-0 justify-center rounded-full border border-fg/10 bg-fg/8 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-fg/60">
                  #{item.caseId}
                </span>

                <Badge tone={statusTone(item.status ?? "")} size="md" className="w-28 shrink-0 justify-center">
                  {formatStatusLabel(item.status ?? "unknown")}
                </Badge>

                <Link
                  href={`/projects/${item.caseId}`}
                  className="min-w-0 flex-1 basis-64"
                >
                  <p className="truncate text-sm font-semibold text-fg transition group-hover:text-accent-200">
                    {item.name || "Untitled project"}
                  </p>
                  <p className="truncate text-xs text-fg/45">
                    {item.caseTypeName || item.caseType || "Unknown type"}
                    {item.description ? ` · ${item.description}` : ""}
                  </p>
                </Link>

                <span className="hidden w-48 shrink-0 whitespace-nowrap text-right text-xs tabular-nums text-fg/40 sm:block">
                  Updated {formatDate(item.updatedAt)}
                </span>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/projects/${item.caseId}`}
                    className={buttonClass("primary", "sm")}
                  >
                    Open
                  </Link>

                  <Link
                    href={`/pathways/${item.caseId}`}
                    className={buttonClass("ghost", "sm")}
                  >
                    Edit
                  </Link>

                  {/* Destructive action last. Rows the user can't delete keep an
                      invisible same-size slot so Open and Edit line up on every row. */}
                  {item.canDelete ? (
                    <button
                      type="button"
                      onClick={() => setPendingDelete(item)}
                      className={buttonClass("danger-soft", "sm")}
                    >
                      Delete
                    </button>
                  ) : (
                    <span aria-hidden="true" className={`${buttonClass("danger-soft", "sm")} invisible`}>
                      Delete
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {pendingDelete && (
        <DeleteProjectDialog
          open
          caseId={pendingDelete.caseId}
          projectName={pendingDelete.name}
          onClose={() => setPendingDelete(null)}
          onDeleted={() => {
            onDeleted?.(pendingDelete.caseId);
            setPendingDelete(null);
          }}
        />
      )}
    </div>
  );
}