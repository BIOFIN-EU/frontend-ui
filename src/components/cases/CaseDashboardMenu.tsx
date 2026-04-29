"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CaseDashboardState } from "@/types/workflow";
import { formatDate } from "@/lib/format";

type Props = {
  caseId: string;
  state: CaseDashboardState;
  canManageUsers: boolean;
};

export function CaseDashboardMenu({ caseId, state, canManageUsers }: Props) {
  const pathname = usePathname();

  const accessHref = `/cases/${caseId}/access`;
  const accessActive = pathname === accessHref;

  return (
    <div className="h-fit rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
          Case summary
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
          Loan Identifier #{state.caseId ?? caseId}
        </h2>

        <div className="mt-3">
          <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
            {state.status || "Unknown"}
          </span>
        </div>
      </div>

      {canManageUsers && (
        <div className="mt-5">
          <Link
            href={accessHref}
            className={[
              "flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition",
              accessActive
                ? "bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "bg-white text-slate-950 hover:bg-white/90",
            ].join(" ")}
          >
            Manage case access
          </Link>
        </div>
      )}

      <dl className="mt-5 space-y-4 border-t border-white/10 pt-5 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-white/35">
            Case type
          </dt>
          <dd className="mt-1 break-words font-medium text-white/80">
            {state.caseType || "—"}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-white/35">
            Created
          </dt>
          <dd className="mt-1 font-medium text-white/80">
            {state.createdAt ? formatDate(state.createdAt) : "—"}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-white/35">
            Updated
          </dt>
          <dd className="mt-1 font-medium text-white/80">
            {state.updatedAt ? formatDate(state.updatedAt) : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}