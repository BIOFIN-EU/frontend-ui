"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import type { CaseListItem } from "@/types/case-list";
import { Select } from "@/components/ui/Select";

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

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-white/90">{value}</p>
    </div>
  );
}

export function ProjectListScreen({ cases }: Props) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const caseTypes = useMemo(
    () =>
      Array.from(
        new Set(cases.map((item) => item.caseType).filter(Boolean))
      ).sort(),
    [cases]
  );

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
        if (typeFilter !== "all" && item.caseType !== typeFilter) return false;
        if (statusFilter !== "all" && item.status !== statusFilter) return false;

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
              Browse, filter, and open your cases from one place.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
            {filteredCases.length} visible
          </div>
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
              {caseTypes.length}
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
                { label: "All", value: "all" },
                ...caseTypes.map((ct) => ({
                  label: ct,
                  value: ct,
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
                { label: "All", value: "all" },
                ...statuses.map((s) => ({
                  label: formatStatusLabel(s),
                  value: s,
                })),
              ]}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {filteredCases.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-sm text-white/60">
            No cases found.
          </div>
        ) : (
          filteredCases.map((item) => (
            <Link
              key={item.caseId}
              href={`/projects/${item.caseId}`}
              className="group block overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-0 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400/30 hover:shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
            >
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400/80 via-emerald-300/40 to-transparent" />

              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-white/65">
                        Project #{item.caseId}
                      </span>

                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusClasses(
                          item.status
                        )}`}
                      >
                        {formatStatusLabel(item.status)}
                      </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white transition group-hover:text-emerald-100">
                      {item.name || "Untitled case"}
                    </h2>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60 line-clamp-2">
                      {item.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-white/35 transition group-hover:text-emerald-200">
                    <span>Open</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <InfoBlock label="Project type" value={item.caseType || "Unknown"} />
                  <InfoBlock
                    label="Created"
                    value={formatDate(item.createdAt)}
                  />
                  <InfoBlock
                    label="Updated"
                    value={formatDate(item.updatedAt)}
                  />
                  <InfoBlock
                    label="Last updated by"
                    value={item.updatedBy || "Unknown"}
                  />
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}