// A project's members, access levels and workflow roles
// (physical-api /case_workflow/cases/{id}/members and friends).

export type AccessLevel = "owner" | "manager" | "editor" | "viewer";
// Levels a member can be given (the owner is handed over, not chosen).
export type AssignableLevel = Exclude<AccessLevel, "owner">;

export type Person = {
  user_id: string;
  display_name: string | null;
  // Full for managers; "j•••@lpa.gov.uk" for other members.
  email: string | null;
  // False for a closed account (or when its details couldn't be loaded).
  known: boolean;
};

export type ProjectMember = Person & {
  level: AccessLevel;
  is_owner: boolean;
  roles: string[];
  is_me: boolean;
};

export type ProjectRole = {
  code: string;
  label: string;
  description: string | null;
  steps: { code: string; title: string | null }[];
};

export type LevelInfo = { code: AccessLevel; label: string; description: string };

export type ProjectMembers = {
  members: ProjectMember[];
  roles: ProjectRole[];
  levels: LevelInfo[];
  my_level: AccessLevel;
  can_manage: boolean;
  is_owner: boolean;
  // An administrator reading a project they aren't a member of.
  support_view: boolean;
};

// How the user may act on something owned by `roles`: as their own role, on
// a role's behalf (a manager, who confirms each time), or not at all.
export type Capacity = {
  kind: "own" | "on_behalf" | "none";
  role: string | null;
  roles: string[];
};

export type MyProjectAccess = {
  level: AccessLevel;
  roles: string[];
  can_update: boolean;
  can_manage: boolean;
  // An administrator reading a project they aren't a member of.
  support_view: boolean;
  steps: Record<string, Capacity>;
  role_labels: Record<string, string>;
};

export type AccessHistoryEntry = {
  id: number;
  action: string;
  action_label: string;
  detail: string | null;
  actor: Person;
  target: Person;
  created_at: string | null;
};

export type WaitingStep = {
  case_id: number;
  step_code: string;
  step_title: string | null;
  roles: string[];
  role_names: string;
};

export type AddMemberRequest = { email: string; level: AssignableLevel; roles: string[] };
export type ChangeMemberRequest = { level?: AssignableLevel; roles?: string[] };
