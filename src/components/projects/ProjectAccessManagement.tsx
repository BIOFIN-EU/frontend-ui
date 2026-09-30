"use client";

import { useState } from "react";
import type { CaseUserAccess } from "@/types/case-access";
import { useAddCaseUser } from "@/queries/projects";
import { buttonClass } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type CaseAccessManagementProps = {
  caseId: number;
  users: CaseUserAccess[];
};

export function ProjectAccessManagement({
  caseId,
  users,
}: CaseAccessManagementProps) {
  // Refreshes the user list once the user is added.
  const addUser = useAddCaseUser(caseId);
  const [showForm, setShowForm] = useState(false);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<
    "borrower" | "funder" | "intermediary"
  >("borrower");

  async function handleAddUser() {
    try {
      await addUser.mutateAsync({
        email,
        case_role: role,
        can_view: true,
        can_update: false,
        can_delete: false,
        can_assign_users: false,
      });

      setEmail("");
      setShowForm(false);
    } catch (err) {
      console.error("Failed to add user", err);
    }
  }

  return (
    <section className="rounded-2xl surface-panel p-6 shadow-panel backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-fg/50">
            Access
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className={buttonClass("primary", "sm")}
        >
          Add user
        </button>
      </div>

      {showForm && (
        <div className="mt-6 space-y-4 rounded-xl surface-card p-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="User email"
            className="w-full rounded-lg bg-fg/10 px-3 py-2 text-sm text-fg outline-none"
          />

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value as "borrower" | "funder" | "intermediary")
            }
            className="w-full rounded-lg bg-fg/10 px-3 py-2 text-sm text-fg outline-none"
          >
            <option value="borrower">Borrower</option>
            <option value="funder">Funder</option>
            <option value="intermediary">Intermediary</option>
          </select>

          <button
            onClick={handleAddUser}
            disabled={addUser.isPending}
            className={buttonClass("primary")}
          >
            {addUser.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {users.length ? (
          users.map((userAccess) => (
            <div
              key={userAccess.id}
              className="rounded-xl surface-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="break-all text-sm font-medium text-fg">
                    {userAccess.user_id}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-fg/50">
                    {userAccess.case_role}
                    {userAccess.is_owner ? " · Owner" : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {userAccess.can_view && <PermissionPill label="View" />}
                  {userAccess.can_update && <PermissionPill label="Update" />}
                  {userAccess.can_delete && <PermissionPill label="Delete" />}
                  {userAccess.can_assign_users && (
                    <PermissionPill label="Manage users" />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-fg/50">No users found.</p>
        )}
      </div>
    </section>
  );
}

function PermissionPill({ label }: { label: string }) {
  return (
    <Badge tone="success" size="md">
      {label}
    </Badge>
  );
}