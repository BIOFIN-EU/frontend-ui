"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/context/auth.context";
import { useCaseUsers } from "@/components/projects/hooks/useCaseUsers";
import { ProjectAccessManagement } from "@/components/projects/ProjectAccessManagement";

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
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-white/70">
        Loading project access…
      </div>
    );
  }

  // The Access tab is hidden for these users; this covers a direct link.
  if (!canManageUsers) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
        You do not have permission to manage users for this case.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight text-white">
        Project access management
      </h2>

      <ProjectAccessManagement
        caseId={numericCaseId}
        users={users}
        onUserAdded={() => window.location.reload()}
      />
    </div>
  );
}