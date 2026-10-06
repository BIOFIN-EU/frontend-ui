"use client";

import { useState } from "react";
import { Crown, History, ShieldCheck, UserPlus } from "lucide-react";

import {
  useAccessHistory,
  useAddMember,
  useChangeMember,
  useProjectMembers,
  useRemoveMember,
  useTransferOwnership,
} from "@/queries/project-access";
import type { AssignableLevel, Person, ProjectMember, ProjectMembers, ProjectRole } from "@/types/project-access";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { fieldClass } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";

type CaseId = number | string;

const ASSIGNABLE: AssignableLevel[] = ["viewer", "editor", "manager"];

/** "Jane Smith · lpa.gov.uk"-style name, with a fallback for closed accounts. */
function personName(person: Person): string {
  if (person.display_name) return person.display_name;
  if (person.email) return person.email;
  return person.known ? "Unknown user" : "Closed account";
}

/**
 * The Access tab: the project's members with their access level and
 * workflow roles, what each role and level means, and (for managers)
 * adding, changing and removing members and the access history. Everyone on
 * the project sees it; only managers can change it.
 */
export function ProjectAccessPanel({ caseId }: { caseId: CaseId }) {
  const { data, isPending, error } = useProjectMembers(caseId);

  if (isPending) {
    return <div className="rounded-2xl surface-panel p-6 text-fg/70">Loading project access…</div>;
  }
  if (error || !data) {
    return <Alert tone="danger">{error?.message || "Could not load the project's members."}</Alert>;
  }

  return (
    <div className="space-y-6">
      <MembersSection caseId={caseId} data={data} />
      {data.can_manage && <AddMemberSection caseId={caseId} data={data} />}
      <div className="grid gap-6 lg:grid-cols-2">
        <RolesSection data={data} />
        <LevelsSection data={data} />
      </div>
      {data.can_manage && <HistorySection caseId={caseId} />}
    </div>
  );
}

// ---------- members ----------

function MembersSection({ caseId, data }: { caseId: CaseId; data: ProjectMembers }) {
  const levelLabel = Object.fromEntries(data.levels.map((l) => [l.code, l.label]));
  return (
    <section className="rounded-2xl surface-panel p-6 shadow-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-fg">Members</h2>
        <p className="text-sm text-fg/60">
          {data.support_view ? (
            "Support view: you aren't a member of this project."
          ) : (
            <>
              You are {data.my_level === "owner" ? "the" : "a"}{" "}
              <span className="font-semibold">{levelLabel[data.my_level]}</span>
              {data.can_manage ? "" : ". Only managers can change who has access."}
            </>
          )}
        </p>
      </div>
      <ul className="mt-5 space-y-3">
        {data.members.map((member) => (
          <MemberRow key={member.user_id} caseId={caseId} member={member} data={data} levelLabel={levelLabel} />
        ))}
      </ul>
    </section>
  );
}

function MemberRow({
  caseId,
  member,
  data,
  levelLabel,
}: {
  caseId: CaseId;
  member: ProjectMember;
  data: ProjectMembers;
  levelLabel: Record<string, string>;
}) {
  const change = useChangeMember(caseId);
  const remove = useRemoveMember(caseId);
  const transfer = useTransferOwnership(caseId);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<"remove" | "transfer" | null>(null);
  const roleLabel = Object.fromEntries(data.roles.map((r) => [r.code, r.label]));
  const name = personName(member);
  const canEditRow = data.can_manage;
  const canChangeLevel = data.can_manage && !member.is_owner;

  async function save(body: { level?: AssignableLevel; roles?: string[] }) {
    setError("");
    try {
      await change.mutateAsync({ userId: member.user_id, ...body });
    } catch (err: any) {
      setError(err?.message || "Could not save the change.");
    }
  }

  function toggleRole(code: string) {
    const roles = member.roles.includes(code) ? member.roles.filter((r) => r !== code) : [...member.roles, code];
    void save({ roles });
  }

  return (
    <li className="rounded-xl surface-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
            {name}
            {member.is_me && <span className="text-xs font-normal text-fg/50">(you)</span>}
            {member.is_owner && (
              <Badge tone="warning">
                <Crown className="mr-1 inline h-3 w-3" aria-hidden="true" />
                Owner
              </Badge>
            )}
          </p>
          {member.display_name && member.email && <p className="mt-0.5 text-xs text-fg/55">{member.email}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canChangeLevel ? (
            <div className="w-36">
              <Select
                value={member.level}
                onChange={(level) => void save({ level: level as AssignableLevel })}
                options={ASSIGNABLE.map((code) => ({ label: levelLabel[code], value: code }))}
                disabled={change.isPending}
              />
            </div>
          ) : member.is_owner ? null : (
            <Badge tone="neutral" size="md">
              {levelLabel[member.level]}
            </Badge>
          )}
          {data.is_owner && !member.is_owner && (
            <button type="button" onClick={() => setConfirm("transfer")} className={buttonClass("ghost", "sm")}>
              Make owner
            </button>
          )}
          {data.can_manage && !member.is_owner && !member.is_me && (
            <button type="button" onClick={() => setConfirm("remove")} className={buttonClass("danger-soft", "sm")}>
              Remove
            </button>
          )}
        </div>
      </div>

      {(data.roles.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg/50">Roles:</span>
          {canEditRow
            ? data.roles.map((role) => {
                const on = member.roles.includes(role.code);
                return (
                  <button
                    key={role.code}
                    type="button"
                    aria-pressed={on}
                    disabled={change.isPending}
                    onClick={() => toggleRole(role.code)}
                    title={role.description ?? undefined}
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition disabled:opacity-60",
                      on
                        ? "bg-accent-500/20 text-accent-100 ring-accent-400/40"
                        : "bg-fg/5 text-fg/55 ring-fg/10 hover:text-fg",
                    ].join(" ")}
                  >
                    {role.label}
                  </button>
                );
              })
            : member.roles.length > 0
              ? member.roles.map((code) => (
                  <Badge key={code} tone="success">
                    {roleLabel[code] ?? code}
                  </Badge>
                ))
              : <span className="text-xs text-fg/45">none</span>}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-danger-200">{error}</p>}

      <ConfirmDialog
        open={confirm === "remove"}
        title={`Remove ${name}?`}
        confirmLabel="Remove"
        busyLabel="Removing…"
        onConfirm={async () => {
          await remove.mutateAsync(member.user_id);
        }}
        onClose={() => setConfirm(null)}
      >
        They lose access to this project, and their roles on it. You can add them again later.
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm === "transfer"}
        title={`Make ${name} the owner?`}
        confirmLabel="Make owner"
        busyLabel="Handing over…"
        onConfirm={async () => {
          await transfer.mutateAsync(member.user_id);
        }}
        onClose={() => setConfirm(null)}
      >
        They become the project&apos;s owner, with full access. You stay on the project as a Manager, and only they can
        hand it back.
      </ConfirmDialog>
    </li>
  );
}

// ---------- adding ----------

function AddMemberSection({ caseId, data }: { caseId: CaseId; data: ProjectMembers }) {
  const add = useAddMember(caseId);
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState<AssignableLevel>("viewer");
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [added, setAdded] = useState("");
  const levelLabel = Object.fromEntries(data.levels.map((l) => [l.code, l.label]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAdded("");
    try {
      await add.mutateAsync({ email: email.trim(), level, roles });
      setAdded(email.trim());
      setEmail("");
      setLevel("viewer");
      setRoles([]);
    } catch (err: any) {
      setError(err?.fieldErrors?.email || err?.message || "Could not add this person.");
    }
  }

  return (
    <section className="rounded-2xl surface-panel p-6 shadow-panel">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
        <UserPlus className="h-5 w-5 text-accent-300" aria-hidden="true" />
        Add a member
      </h2>
      <p className="mt-1 text-sm text-fg/60">
        They need an account on the dashboard first. Giving someone a role makes them at least an Editor, so they can
        complete that role&apos;s steps.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <label className="space-y-1">
            <span className="text-label">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organisation.org"
              className={fieldClass()}
            />
          </label>
          <div className="space-y-1">
            <span className="text-label">Access level</span>
            <Select
              value={level}
              onChange={(value) => setLevel(value as AssignableLevel)}
              options={ASSIGNABLE.map((code) => ({ label: levelLabel[code], value: code }))}
            />
          </div>
        </div>
        {data.roles.length > 0 && (
          <fieldset>
            <legend className="text-label">Roles (optional)</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.roles.map((role) => {
                const on = roles.includes(role.code);
                return (
                  <button
                    key={role.code}
                    type="button"
                    aria-pressed={on}
                    title={role.description ?? undefined}
                    onClick={() => setRoles(on ? roles.filter((r) => r !== role.code) : [...roles, role.code])}
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                      on ? "bg-accent-500/20 text-accent-100 ring-accent-400/40" : "bg-fg/5 text-fg/55 ring-fg/10 hover:text-fg",
                    ].join(" ")}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
        {error && <Alert tone="danger">{error}</Alert>}
        {added && <Alert tone="success">{added} added.</Alert>}
        <button type="submit" disabled={add.isPending || !email.trim()} className={`${buttonClass("primary")} disabled:opacity-60`}>
          {add.isPending ? "Adding…" : "Add member"}
        </button>
      </form>
    </section>
  );
}

// ---------- explanations ----------

function RolesSection({ data }: { data: ProjectMembers }) {
  if (data.roles.length === 0) {
    return (
      <section className="rounded-2xl surface-panel p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-fg">Roles</h2>
        <p className="mt-2 text-sm text-fg/60">This pathway has no roles: every Editor can complete every step.</p>
      </section>
    );
  }
  return (
    <section className="rounded-2xl surface-panel p-6 shadow-panel">
      <h2 className="text-lg font-semibold text-fg">Roles on this project</h2>
      <p className="mt-1 text-sm text-fg/60">
        A role decides which steps someone completes. Managers can record a step on behalf of a role.
      </p>
      <ul className="mt-4 space-y-4">
        {data.roles.map((role) => (
          <RoleItem key={role.code} role={role} holders={data.members.filter((m) => m.roles.includes(role.code))} />
        ))}
      </ul>
    </section>
  );
}

function RoleItem({ role, holders }: { role: ProjectRole; holders: ProjectMember[] }) {
  return (
    <li>
      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
        {role.label}
        {holders.length === 0 ? (
          <Badge tone="warning">Unassigned</Badge>
        ) : (
          <span className="text-xs font-normal text-fg/55">{holders.map(personName).join(", ")}</span>
        )}
      </p>
      {role.description && <p className="mt-0.5 text-sm text-fg/65">{role.description}</p>}
      <p className="mt-1 text-xs text-fg/50">
        {role.steps.length
          ? `Steps: ${role.steps.map((s) => s.title ?? s.code).join(" · ")}`
          : "No steps of its own: reviews the project."}
      </p>
    </li>
  );
}

function LevelsSection({ data }: { data: ProjectMembers }) {
  return (
    <section className="rounded-2xl surface-panel p-6 shadow-panel">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
        <ShieldCheck className="h-5 w-5 text-accent-300" aria-hidden="true" />
        Access levels
      </h2>
      <dl className="mt-4 space-y-3">
        {data.levels.map((level) => (
          <div key={level.code}>
            <dt className="text-sm font-semibold text-fg">{level.label}</dt>
            <dd className="text-sm text-fg/65">{level.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ---------- history ----------

function HistorySection({ caseId }: { caseId: CaseId }) {
  const { data: history = [], isPending } = useAccessHistory(caseId, true);
  return (
    <section className="rounded-2xl surface-panel p-6 shadow-panel">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
        <History className="h-5 w-5 text-accent-300" aria-hidden="true" />
        Access history
      </h2>
      {isPending ? (
        <p className="mt-3 text-sm text-fg/60">Loading…</p>
      ) : history.length === 0 ? (
        <p className="mt-3 text-sm text-fg/60">No changes recorded yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-fg/10 text-sm">
          {history.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
              <span className="text-fg/85">
                <span className="font-semibold text-fg">{entry.action_label}</span>
                {entry.action !== "admin_viewed" && <>: {personName(entry.target)}</>}
                {entry.detail && <span className="text-fg/60"> ({entry.detail})</span>}
                <span className="text-fg/50"> · by {personName(entry.actor)}</span>
              </span>
              <span className="text-xs text-fg/50">
                {entry.created_at ? new Date(entry.created_at).toLocaleString("en-GB") : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
