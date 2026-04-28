export type CaseRole = "borrower" | "funder" | "intermediary";

export interface CaseUserAccess {
  id: number;
  case_id: number;
  user_id: string;
  case_role: CaseRole;
  is_owner: boolean;
  can_view: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_assign_users: boolean;
}

export interface AssignCaseUserRequest {
  email: string;
  case_role: CaseRole;
  can_view: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_assign_users: boolean;
}

export interface UpdateCaseUserAccessRequest {
  case_role?: CaseRole;
  can_view?: boolean;
  can_update?: boolean;
  can_delete?: boolean;
  can_assign_users?: boolean;
}

export interface CaseAccessAuditLog {
  id: number;
  case_id: number;
  actor_user_id: string;
  target_user_id: string;
  action: string;
  details: string | null;
  created_at: string;
}