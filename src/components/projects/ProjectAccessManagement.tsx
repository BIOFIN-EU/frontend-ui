"use client";

import { useState } from "react";
import type { CaseUserAccess } from "@/types/case-access";
import { addCaseUser } from "@/services/case-access.service";

type CaseAccessManagementProps = {
  caseId: number;
  users: CaseUserAccess[];
  onUserAdded: () => void;
};

export function ProjectAccessManagement({
  caseId,
  users,
  onUserAdded,
}: CaseAccessManagementProps) {
  const [showForm, setShowForm] = useState(false);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<
    "borrower" | "funder" | "intermediary"
  >("borrower");

  async function handleAddUser() {
    try {
      await addCaseUser(caseId, {
        email,
        case_role: role,
        can_view: true,
        can_update: false,
        can_delete: false,
        can_assign_users: false,
      });

      setEmail("");
      setShowForm(false);
      onUserAdded();
    } catch (err) {
      console.error("Failed to add user", err);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Access
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Add user
        </button>
      </div>

      {showForm && (
        <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="User email"
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none"
          />

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value as "borrower" | "funder" | "intermediary")
            }
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="borrower">Borrower</option>
            <option value="funder">Funder</option>
            <option value="intermediary">Intermediary</option>
          </select>

          <button
            onClick={handleAddUser}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white"
          >
            Save
          </button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {users.length ? (
          users.map((userAccess) => (
            <div
              key={userAccess.id}
              className="rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="break-all text-sm font-medium text-white">
                    {userAccess.user_id}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-white/50">
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
          <p className="text-sm text-white/50">No users found.</p>
        )}
      </div>
    </section>
  );
}

function PermissionPill({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200 ring-1 ring-emerald-400/25">
      {label}
    </span>
  );
}