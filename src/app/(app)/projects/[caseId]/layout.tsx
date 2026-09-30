"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/context/auth.context";
import { useCaseUsers } from "@/components/projects/hooks/useCaseUsers";
import { ProjectTabs } from "@/components/projects/ProjectTabs";

// Shared header and section tabs for every page of a project
// (Overview, Vulnerability Index, Access).
export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;

  const { user } = useAuth();
  const { users, loading } = useCaseUsers(Number(caseId));

  const myAccess = users.find((u) => u.user_id === user?.id);
  // Hidden until the access list has loaded, so it never flashes in for
  // users who can't manage it.
  const canManageUsers = !loading && Boolean(myAccess?.can_assign_users);

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

        <ProjectTabs caseId={caseId} canManageUsers={canManageUsers} />
      </header>

      {children}
    </div>
  );
}
