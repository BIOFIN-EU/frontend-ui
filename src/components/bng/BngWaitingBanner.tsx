"use client";

import Link from "next/link";
import { useState } from "react";
import { BellRing, ChevronDown } from "lucide-react";
import { useBngWaiting } from "@/queries/bng";
import { roleNames } from "@/types/bng";
import type { CaseListItem } from "@/types/case-list";

/**
 * BNG projects whose current step is for one of the user's roles. Renders
 * nothing when there are none (so for every user without BNG roles).
 */
export function BngWaitingBanner({ cases }: { cases: CaseListItem[] }) {
  // Silent on failure: then nothing is waiting.
  const { data: waiting = [] } = useBngWaiting();
  // Collapsed by default: just the count, the list on click.
  const [open, setOpen] = useState(false);

  if (waiting.length === 0) return null;

  const names = new Map(cases.map((item) => [item.caseId, item.name]));

  return (
    <section className="rounded-2xl border border-warning-400/25 bg-warning-500/10 px-5 py-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="bng-waiting-list"
        className="flex w-full items-center justify-between gap-3 py-1 text-left text-sm font-semibold text-warning-50"
      >
        <span className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-warning-300" aria-hidden="true" />
          Waiting for you ({waiting.length})
          <span className="font-normal text-warning-100/70">· BNG steps for your roles</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-warning-200 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <ul id="bng-waiting-list" className="mb-2 mt-3 space-y-2 text-sm">
          {waiting.map((item) => (
            <li key={item.case_id} className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-fg/85">
                <span className="font-semibold text-fg">{names.get(item.case_id) || "BNG project"}</span>
                {" · "}
                {item.step_title ?? item.step_code}
                <span className="text-fg/55"> (as {roleNames(item.roles)})</span>
              </span>
              <Link href={`/pathways/${item.case_id}`} className="font-semibold !text-warning-100 hover:!text-fg">
                Continue →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
