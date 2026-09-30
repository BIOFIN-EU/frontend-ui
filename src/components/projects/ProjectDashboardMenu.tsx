"use client";

import Link from "next/link";
import type { CaseDashboardState } from "@/types/case-dashboard";
import { formatDate } from "@/lib/format";
import { buttonClass } from "@/components/ui/Button";

type Props = {
  caseId: string;
  state: CaseDashboardState;
  // Shown only when set (the user has can_delete).
  onDelete?: () => void;
};

// Vulnerability Index and Access are project tabs (ProjectTabs), not buttons here.
export function ProjectDashboardMenu({ caseId, state, onDelete }: Props) {
  return (
    <div className="h-fit rounded-3xl surface-panel p-5 shadow-panel">
      <div>
        <p className="text-eyebrow tracking-[0.2em]">
          Project summary
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-fg">
          Project Identifier #{state.caseId ?? caseId}
        </h2>

        <div className="mt-3">
          <span className="inline-flex rounded-full bg-accent-500/15 px-2.5 py-1 text-xs font-semibold text-accent-200 ring-1 ring-accent-400/25">
            {state.status || "Unknown"}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Link
          href={`/pathways/${caseId}`}
          className={`w-full ${buttonClass("primary")}`}
        >
          Edit project
        </Link>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className={`w-full ${buttonClass("danger-soft")}`}
          >
            Delete project
          </button>
        )}
      </div>

      <dl className="mt-5 space-y-4 border-t border-fg/10 pt-5 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-fg/35">
            Project type
          </dt>
          <dd className="mt-1 break-words font-medium text-fg/80">
            {state.caseTypeName || state.caseType || "—"}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-fg/35">
            Created
          </dt>
          <dd className="mt-1 font-medium text-fg/80">
            {state.createdAt ? formatDate(state.createdAt) : "—"}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-fg/35">
            Updated
          </dt>
          <dd className="mt-1 font-medium text-fg/80">
            {state.updatedAt ? formatDate(state.updatedAt) : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
