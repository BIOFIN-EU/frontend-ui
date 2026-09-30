"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { bngService } from "@/services/bng.service";
import { bngKeys, useCaseRoles } from "@/queries/bng";
import { useRefreshCaseData } from "@/queries/workflow";
import { BNG_ROLE_LABEL, BNG_ROLES, type BngRole } from "@/types/bng";
import type { CaseUserAccess } from "@/types/case-access";
import { buttonClass } from "@/components/ui/Button";

type Props = {
  caseId: number;
  users: CaseUserAccess[];
  currentUserId?: string;
};

/**
 * BNG projects only (renders nothing for others): each member's BNG roles,
 * which decide the steps they can complete. A user can hold several.
 */
export function BngRolesPanel({ caseId, users, currentUserId }: Props) {
  const queryClient = useQueryClient();
  const refreshCaseData = useRefreshCaseData();
  // Null while loading, and for a project that isn't BNG (the request fails).
  const roles = useCaseRoles(caseId).data ?? null;
  // Unsaved ticks, per user; kept when the saved roles reload.
  const [edits, setEdits] = useState<Record<string, BngRole[]>>({});
  const draft = { ...(roles ?? {}), ...edits };
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ userId: string; text: string; error?: boolean } | null>(null);

  if (roles === null) return null;

  function toggle(userId: string, role: BngRole) {
    const mine = draft[userId] ?? [];
    setEdits((current) => ({ ...current, [userId]: mine.includes(role) ? mine.filter((r) => r !== role) : [...mine, role] }));
  }

  async function save(userId: string) {
    setSavingId(userId);
    setMessage(null);
    try {
      const saved = await bngService.setUserRoles(caseId, userId, draft[userId] ?? []);
      queryClient.setQueryData<Record<string, BngRole[]>>(bngKeys.roles(caseId), (current) => ({
        ...(current ?? {}),
        [userId]: saved.roles,
      }));
      // Roles decide who can act on steps (e.g. "Waiting for you").
      void refreshCaseData(caseId);
      setMessage({ userId, text: "Roles saved" });
    } catch (err: any) {
      setMessage({ userId, text: err?.message || "Could not save the roles.", error: true });
    } finally {
      setSavingId(null);
    }
  }

  const changed = (userId: string) =>
    [...(draft[userId] ?? [])].sort().join() !== [...(roles[userId] ?? [])].sort().join();

  return (
    <section className="rounded-2xl border border-accent-400/20 bg-accent-500/[0.05] p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-fg/50">Biodiversity Net Gain roles</p>
      <p className="mt-2 max-w-3xl text-sm text-fg/65">
        Roles decide which steps each person completes, for example the Local Planning Authority approves the gain
        plan. A person can have several roles. Giving someone a role also lets them update the project. Users who
        can manage users can record a decision on behalf of a role that has no user yet.
      </p>

      <div className="mt-5 space-y-3">
        {users.map((member) => (
          <div key={member.user_id} className="rounded-xl surface-card p-4">
            <p className="break-all text-sm font-medium text-fg">
              {member.user_id}
              {member.user_id === currentUserId && <span className="ml-2 text-xs text-fg/50">(you)</span>}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {BNG_ROLES.map((role) => {
                const on = (draft[member.user_id] ?? []).includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(member.user_id, role)}
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                      on
                        ? "bg-accent-500/20 text-accent-100 ring-accent-400/40"
                        : "bg-fg/5 text-fg/60 ring-fg/10 hover:text-fg",
                    ].join(" ")}
                  >
                    {BNG_ROLE_LABEL[role]}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => save(member.user_id)}
                disabled={!changed(member.user_id) || savingId === member.user_id}
                className={`${buttonClass("primary", "sm")} disabled:opacity-50`}
              >
                {savingId === member.user_id ? "Saving…" : "Save roles"}
              </button>
              {message?.userId === member.user_id && (
                <span className={`text-xs ${message.error ? "text-danger-200" : "text-accent-300"}`}>{message.text}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
