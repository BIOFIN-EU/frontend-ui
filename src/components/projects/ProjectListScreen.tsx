"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import type { CaseListItem } from "@/types/case-list";
import { Select } from "@/components/ui/Select";
import { buttonBase, buttonBaseSm, buttonGhost, buttonPrimary } from "@/lib/ui";

type Props = {
  cases: CaseListItem[];
};

function safeLower(value: unknown) {
  return typeof value === "string" ? value.toLowerCase() : "";
}

function getStatusClasses(status: string) {
  switch (safeLower(status)) {
    case "draft":
      return "border-amber-400/25 bg-amber-500/10 text-amber-200";
    case "completed":
      return "border-emerald-400/25 bg-emerald-500/10 text-emerald-200";
    case "submitted":
      return "border-sky-400/25 bg-sky-500/10 text-sky-200";
    case "in_progress":
      return "border-violet-400/25 bg-violet-500/10 text-violet-200";
    default:
      return "border-white/10 bg-white/10 text-white/70";
  }
}

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export function ProjectListScreen({ cases }: Props) {
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
        new Set(cases.map((item) => item.status).filter(Boolean))
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
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200/70">
              Projects
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Project dashboard
            </h1>

            <p className="max-w-2xl text-sm leading-6 text-white/60">
              Browse, filter, and open your projects from one place.
            </p>
          </div>

          <Link
            href="/pathways"
            className={`${buttonBase} ${buttonPrimary}`}
          >
            Create New Project
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              Total projects
            </p>

            <p className="mt-3 text-3xl font-semibold text-white">
              {cases.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              Project types
            </p>

            <p className="mt-3 text-3xl font-semibold text-white">
              {caseTypeOptions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              Statuses
            </p>

            <p className="mt-3 text-3xl font-semibold text-white">
              {statuses.length}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            Filter projects
          </p>

          <div className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
            {filteredCases.length} visible
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.5fr_0.85fr_0.85fr]">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              Search
            </label>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by case id, name, type, status..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/30 focus:bg-black/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
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
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
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

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        {filteredCases.length === 0 ? (
          <div className="p-8 text-sm text-white/60">No projects found.</div>
        ) : (
          <div className="divide-y divide-white/8">
            {filteredCases.map((item) => (
              <div
                key={item.caseId}
                className="group flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition hover:bg-white/[0.04]"
              >
                <span className="shrink-0 rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[11px] font-semibold text-white/60">
                  #{item.caseId}
                </span>

                <span
                  className={`inline-flex w-28 shrink-0 items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${getStatusClasses(
                    item.status
                  )}`}
                >
                  {formatStatusLabel(item.status)}
                </span>

                <Link
                  href={`/projects/${item.caseId}`}
                  className="min-w-0 flex-1 basis-64"
                >
                  <p className="truncate text-sm font-semibold text-white transition group-hover:text-emerald-200">
                    {item.name || "Untitled project"}
                  </p>
                  <p className="truncate text-xs text-white/45">
                    {item.caseTypeName || item.caseType || "Unknown type"}
                    {item.description ? ` · ${item.description}` : ""}
                  </p>
                </Link>

                <span className="hidden shrink-0 text-xs text-white/40 sm:block">
                  Updated {formatDate(item.updatedAt)}
                </span>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/pathways/${item.caseId}`}
                    className={`${buttonBaseSm} ${buttonGhost}`}
                  >
                    Edit
                  </Link>

                  <Link
                    href={`/projects/${item.caseId}`}
                    className={`${buttonBaseSm} ${buttonPrimary}`}
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}