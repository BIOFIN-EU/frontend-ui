import { apiFetch } from "@/lib/api";

import type {
  AssignCaseUserRequest,
  CaseAccessAuditLog,
  CaseUserAccess,
  UpdateCaseUserAccessRequest,
} from "@/types/case-access";

const BASE = "/api/case_workflow";

export async function listCaseUsers(caseId: number) {
  return apiFetch<CaseUserAccess[]>(`${BASE}/cases/${caseId}/users`, {
    method: "GET",
  });
}

export async function addCaseUser(
  caseId: number,
  payload: AssignCaseUserRequest
) {
  return apiFetch<CaseUserAccess>(`${BASE}/cases/${caseId}/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCaseUser(
  caseId: number,
  userId: string,
  payload: UpdateCaseUserAccessRequest
) {
  return apiFetch<CaseUserAccess>(
    `${BASE}/cases/${caseId}/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function removeCaseUser(caseId: number, userId: string) {
  return apiFetch<void>(`${BASE}/cases/${caseId}/users/${userId}`, {
    method: "DELETE",
  });
}

export async function listCaseAccessAudit(caseId: number) {
  return apiFetch<CaseAccessAuditLog[]>(
    `${BASE}/cases/${caseId}/access-audit`,
    {
      method: "GET",
    }
  );
}