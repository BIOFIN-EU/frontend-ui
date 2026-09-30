"use client";

// Data hooks for projects (cases). Pages use these instead of calling the
// services directly, so each piece of data is loaded once, shared between
// the components that show it, and refreshed after a change.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { caseListService } from "@/services/case-list.service";
import { caseDashboardService } from "@/services/case-dashboard.service";
import { addCaseUser, listCaseUsers } from "@/services/case-access.service";
import type { AssignCaseUserRequest } from "@/types/case-access";
import type { CaseListItem } from "@/types/case-list";

type CaseId = number | string;

export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
  detail: (caseId: CaseId) => [...projectKeys.all, String(caseId)] as const,
  dashboard: (caseId: CaseId) => [...projectKeys.detail(caseId), "dashboard"] as const,
  users: (caseId: CaseId) => [...projectKeys.detail(caseId), "users"] as const,
};

/** The projects the user can see. */
export function useCases() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: () => caseListService.getCases(),
  });
}

/** A project's data, as shown on its dashboard. */
export function useCaseDashboard(caseId: CaseId) {
  return useQuery({
    queryKey: projectKeys.dashboard(caseId),
    queryFn: () => caseDashboardService.getCaseDashboard(caseId),
    enabled: Boolean(caseId),
  });
}

/** Who has access to a project, and with which permissions. */
export function useCaseUsers(caseId: CaseId) {
  return useQuery({
    queryKey: projectKeys.users(caseId),
    queryFn: () => listCaseUsers(Number(caseId)),
    enabled: Boolean(caseId),
  });
}

/** The current user's own access to a project (undefined while loading). */
export function useMyCaseAccess(caseId: CaseId, userId: string | undefined) {
  const users = useCaseUsers(caseId);
  return { ...users, data: users.data?.find((u) => u.user_id === userId) };
}

export function useAddCaseUser(caseId: CaseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignCaseUserRequest) => addCaseUser(Number(caseId), payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.users(caseId) }),
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (caseId: CaseId) => caseListService.deleteCase(caseId),
    onSuccess: (_, caseId) => {
      queryClient.setQueryData<CaseListItem[]>(projectKeys.list(), (cases) =>
        cases?.filter((c) => String(c.caseId) !== String(caseId))
      );
      queryClient.removeQueries({ queryKey: projectKeys.detail(caseId) });
    },
  });
}
