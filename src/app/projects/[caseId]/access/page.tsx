"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/context/auth.context";
import { useCaseUsers } from "@/components/projects/hooks/useCaseUsers";
import { ProjectAccessManagement } from "@/components/projects/ProjectAccessManagement";
import { BngRolesPanel } from "@/components/bng/BngRolesPanel";
import { Alert } from "@/components/ui/Alert";

export default function CaseAccessPage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;
  const numericCaseId = Number(caseId);

  const { user } = useAuth();
  const { users, loading } = useCaseUsers(numericCaseId);

  const myAccess = users.find((u) => u.user_id === user?.id);
  const canManageUsers = Boolean(myAccess?.can_assign_users);

  if (!user || loading) {
    return (
      <div className="rounded-2xl surface-panel p-6 text-fg/70">
        Loading project access…
      </div>
    );
  }

  // The Access tab is hidden for these users; this covers a direct link.
  if (!canManageUsers) {
    return (
      <Alert tone="danger">
        You do not have permission to manage users for this case.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight text-fg">
        Project access management
      </h2>

      <ProjectAccessManagement
        caseId={numericCaseId}
        users={users}
        onUserAdded={() => window.location.reload()}
      />

      {/* BNG projects only; renders nothing for other projects. */}
      <BngRolesPanel caseId={numericCaseId} users={users} currentUserId={user?.id} />
    </div>
  );
}