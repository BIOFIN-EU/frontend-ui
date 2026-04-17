"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import type { CaseListItem } from "@/types/case-list";

type Props = {
  cases: CaseListItem[];
};

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "draft":
      return "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/25";
    case "completed":
      return "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/25";
    case "submitted":
      return "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/25";
    default:
      return "bg-white/10 text-white/70 ring-1 ring-white/10";
  }
}

export function CaseListScreen({ cases }: Props) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const caseTypes = useMemo(
    () => Array.from(new Set(cases.map((item) => item.caseType))).sort(),
    [cases]
  );

  const statuses = useMemo(
    () => Array.from(new Set(cases.map((item) => item.status))).sort(),
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
          String(item.caseId).includes(q) ||
          item.caseType.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          item.createdBy.toLowerCase().includes(q) ||
          item.updatedBy.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.caseId - a.caseId);
  }, [cases, query, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Cases
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Case dashboard
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Browse and open any case.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
            {filteredCases.length} visible
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wider text-white/50">Total cases</p>
            <p className="mt-2 text-2xl font-semibold text-white">{cases.length}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wider text-white/50">Case types</p>
            <p className="mt-2 text-2xl font-semibold text-white">{caseTypes.length}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wider text-white/50">Statuses</p>
            <p className="mt-2 text-2xl font-semibold text-white">{statuses.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">
              Search
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by case id, type, status, user..."
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">
              Case type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all">All</option>
              {caseTypes.map((caseType) => (
                <option key={caseType} value={caseType}>
                  {caseType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all">All</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {filteredCases.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-sm text-white/60">
            No cases found.
          </div>
        ) : (
          filteredCases.map((item) => (
            <Link
              key={item.caseId}
              href={`/cases/${item.caseId}`}
              className="block rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-md transition hover:border-emerald-400/30 hover:bg-white/[0.07]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70 ring-1 ring-white/10">
                    Case #{item.caseId}
                  </div>

                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">
                    {item.caseType}
                  </h2>

                  <p className="mt-2 text-sm text-white/50">
                    Open case dashboard
                  </p>
                </div>

                <div
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusClasses(item.status)}`}
                >
                  {item.status}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/50">
                    Created at
                  </p>
                  <p className="mt-2 text-sm text-white/90">
                    {formatDate(item.createdAt)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/50">
                    Updated at
                  </p>
                  <p className="mt-2 text-sm text-white/90">
                    {formatDate(item.updatedAt)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/50">
                    Created by
                  </p>
                  <p className="mt-2 break-all text-sm text-white/90">
                    {item.createdBy}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-white/50">
                    Updated by
                  </p>
                  <p className="mt-2 break-all text-sm text-white/90">
                    {item.updatedBy}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}