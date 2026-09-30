"use client";

import { formatDay, type BngSignoff } from "@/types/bng";

const DECISION_LABEL: Record<BngSignoff["decision"], string> = {
  submitted: "Completed",
  approved: "Approved",
  rejected: "Rejected",
  edited: "Edited",
};

const DECISION_STYLE: Record<BngSignoff["decision"], string> = {
  submitted: "text-fg/80",
  approved: "text-accent-200",
  rejected: "text-danger-200",
  edited: "text-info-200",
};

/** Who completed, approved or rejected each BNG step, and in which role. */
export function BngSignoffsCard({ titles, signoffs }: { titles?: Record<string, string | undefined>; signoffs?: unknown }) {
  const rows = Array.isArray(signoffs) ? (signoffs as BngSignoff[]) : [];

  return (
    <section className="rounded-2xl surface-card p-5">
      <h3 className="text-base font-semibold text-fg">Sign-off history</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-fg/60">
          Nothing signed off yet. Each step is recorded here with the role that completed it.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-fg/10 text-sm">
          {[...rows].reverse().map((row) => (
            <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <p className="text-fg">
                  <span className={`font-semibold ${DECISION_STYLE[row.decision]}`}>{DECISION_LABEL[row.decision]}</span>
                  {" · "}
                  {titles?.[row.step_code] ?? row.step_code}
                </p>
                <p className="text-xs text-fg/55">
                  {row.on_behalf
                    ? `Recorded by the project manager on behalf of the ${row.role_label ?? "role"}`
                    : `By the ${row.role_label ?? "project team"}`}
                </p>
                {row.comment && <p className="mt-1 text-xs text-danger-100/80">Reason: {row.comment}</p>}
              </div>
              <span className="text-xs text-fg/45">{formatDay(row.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
