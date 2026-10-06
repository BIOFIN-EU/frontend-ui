"use client";

import { useParams } from "next/navigation";

import { LifeBuoy } from "lucide-react";

import { useCaseDashboard } from "@/queries/projects";
import { useMyAccess } from "@/queries/project-access";
import { ProjectTabs } from "@/components/projects/ProjectTabs";
import { Alert } from "@/components/ui/Alert";

// Shared header and section tabs for every page of a project
// (Overview, Vulnerability Index, Access).
export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;

  const { data: myAccess } = useMyAccess(caseId);
  // The backend adds BNG data (bng_metric) to BNG projects only.
  const isBng = Boolean(useCaseDashboard(caseId).data?.bng_metric);

  return (
    <div className="space-y-8">
      <header className="space-y-6">
        <div>
          <div className="inline-flex w-fit items-center rounded-full bg-accent-500/15 px-3 py-1 text-xs font-semibold text-accent-200 ring-1 ring-accent-400/25">
            Project Identifier #{caseId}
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg">
            Project Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-fg/60">
            Review and edit project data, and explore its biodiversity risk.
          </p>
        </div>

        <ProjectTabs caseId={caseId} isBng={isBng} />

        {myAccess?.support_view && (
          <Alert tone="info" className="flex items-start gap-3">
            <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              <span className="font-semibold">Support view.</span> You can read this project as an administrator but
              aren&apos;t a member, so you can&apos;t change it. Your visit is shown in its access history.
            </span>
          </Alert>
        )}
      </header>

      {children}
    </div>
  );
}
