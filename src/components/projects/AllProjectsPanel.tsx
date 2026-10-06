"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, LifeBuoy } from "lucide-react";
import { useAllCases } from "@/queries/project-access";
import { fieldClass } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";

/**
 * Administrators only (renders nothing for anyone else): every project on
 * the platform, to open read-only for support. Opening one a user isn't a
 * member of is recorded in that project's access history.
 */
export function AllProjectsPanel() {
  const { data: cases } = useAllCases();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (cases ?? []).filter(
      (item) =>
        !term ||
        String(item.caseId).includes(term) ||
        (item.name ?? "").toLowerCase().includes(term) ||
        (item.caseTypeName ?? "").toLowerCase().includes(term)
    );
  }, [cases, search]);

  if (!cases) return null;

  return (
    <section className="rounded-2xl border border-info-400/20 bg-info-500/[0.06] px-5 py-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="all-projects-list"
        className="flex w-full items-center justify-between gap-3 py-1 text-left text-sm font-semibold text-fg"
      >
        <span className="flex items-center gap-2">
          <LifeBuoy className="h-4 w-4 text-info-300" aria-hidden="true" />
          All projects ({cases.length})
          <span className="font-normal text-fg/55">· administrator, read-only support access</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-fg/60 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div id="all-projects-list" className="mb-2 mt-3 space-y-3">
          <p className="text-xs text-fg/55">
            Opening a project you aren&apos;t a member of is shown in its access history.
          </p>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, number or pathway"
            aria-label="Search all projects"
            className={fieldClass()}
          />
          <ul className="max-h-96 divide-y divide-fg/10 overflow-y-auto text-sm">
            {shown.map((item) => (
              <li key={item.caseId} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="min-w-0 text-fg/85">
                  <span className="font-semibold text-fg">{item.name || `Project #${item.caseId}`}</span>
                  <span className="text-fg/55"> · #{item.caseId} · {item.caseTypeName}</span>
                  {item.isMember && (
                    <Badge tone="success" className="ml-2">
                      Member
                    </Badge>
                  )}
                </span>
                <Link href={`/projects/${item.caseId}`} className="font-semibold !text-info-200 hover:!text-fg">
                  Open →
                </Link>
              </li>
            ))}
            {shown.length === 0 && <li className="py-2 text-fg/55">No project matches.</li>}
          </ul>
        </div>
      )}
    </section>
  );
}
