import { apiFetch } from "@/lib/api";
import type { CaseListItem } from "@/types/case-list";
import type {
  AccessHistoryEntry,
  AddMemberRequest,
  ChangeMemberRequest,
  MyProjectAccess,
  ProjectMembers,
  WaitingStep,
} from "@/types/project-access";

const BASE = "/api/case_workflow";

type CaseId = number | string;

export const projectAccessService = {
  getMembers(caseId: CaseId): Promise<ProjectMembers> {
    return apiFetch<ProjectMembers>(`${BASE}/cases/${caseId}/members`);
  },

  // Errors are shown next to the form, not as a toast.
  addMember(caseId: CaseId, body: AddMemberRequest): Promise<ProjectMembers> {
    return apiFetch<ProjectMembers>(`${BASE}/cases/${caseId}/members`, {
      method: "POST",
      body: JSON.stringify(body),
      silent: true,
    });
  },

  changeMember(caseId: CaseId, userId: string, body: ChangeMemberRequest): Promise<ProjectMembers> {
    return apiFetch<ProjectMembers>(`${BASE}/cases/${caseId}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      silent: true,
    });
  },

  removeMember(caseId: CaseId, userId: string): Promise<ProjectMembers> {
    return apiFetch<ProjectMembers>(`${BASE}/cases/${caseId}/members/${userId}`, { method: "DELETE", silent: true });
  },

  transferOwnership(caseId: CaseId, userId: string): Promise<ProjectMembers> {
    return apiFetch<ProjectMembers>(`${BASE}/cases/${caseId}/transfer-ownership`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
      silent: true,
    });
  },

  getHistory(caseId: CaseId): Promise<AccessHistoryEntry[]> {
    return apiFetch<AccessHistoryEntry[]>(`${BASE}/cases/${caseId}/access-history`);
  },

  getMyAccess(caseId: CaseId): Promise<MyProjectAccess> {
    return apiFetch<MyProjectAccess>(`${BASE}/cases/${caseId}/my-access`, { silent: true });
  },

  // Silent on failure: then nothing is waiting.
  getWaiting(): Promise<WaitingStep[]> {
    return apiFetch<WaitingStep[]>(`${BASE}/waiting`, { silent: true });
  },

  // Administrators only: 403 (silent) for everyone else.
  getAllCases(): Promise<(CaseListItem & { isMember: boolean })[]> {
    return apiFetch(`${BASE}/admin/cases`, { silent: true });
  },
};
