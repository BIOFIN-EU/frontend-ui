"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useCaseDashboard } from "@/queries/projects";
import { useMyAccess } from "@/queries/project-access";
import { caseDashboardService } from "@/services/case-dashboard.service";
import { ProjectDashboardScreen } from "@/components/projects/ProjectDashboardScreen";
import { ProjectDashboardMenu } from "@/components/projects/ProjectDashboardMenu";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import { Alert } from "@/components/ui/Alert";

export default function CaseDashboardPage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;

  const router = useRouter();

  const { data: myAccess } = useMyAccess(caseId);
  // Managers (and the owner) can delete a project.
  const canDelete = myAccess?.level === "owner" || myAccess?.level === "manager";
  const canEdit = Boolean(myAccess?.can_update);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: state, isPending, error } = useCaseDashboard(caseId);

  return (
    <div className="space-y-8">
      {isPending && (
        <div className="rounded-2xl surface-panel p-6 text-fg/70">
          Loading project dashboard...
        </div>
      )}

      {error && (
        <Alert tone="danger">
          {caseDashboardService.extractErrorMessage(error)}
        </Alert>
      )}

      {state && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <main className="min-w-0 space-y-8">
            <ProjectDashboardScreen key={String(caseId)} state={state} />
          </main>

          <aside className="min-w-0 xl:sticky xl:top-24">
            <ProjectDashboardMenu
              caseId={caseId}
              state={state}
              onDelete={canDelete ? () => setConfirmDelete(true) : undefined}
              canEdit={canEdit}
            />
          </aside>
        </div>
      )}

      <DeleteProjectDialog
        open={confirmDelete}
        caseId={caseId}
        onClose={() => setConfirmDelete(false)}
        onDeleted={() => router.replace(`/projects?deleted=${caseId}`)}
      />
    </div>
  );
}