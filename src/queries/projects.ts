"use client";

// Data hooks for projects (cases). Pages use these instead of calling the
// services directly, so each piece of data is loaded once, shared between
// the components that show it, and refreshed after a change.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { caseListService } from "@/services/case-list.service";
import { caseDashboardService } from "@/services/case-dashboard.service";
import type { CaseListItem } from "@/types/case-list";

type CaseId = number | string;

export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
  detail: (caseId: CaseId) => [...projectKeys.all, String(caseId)] as const,
  dashboard: (caseId: CaseId) => [...projectKeys.detail(caseId), "dashboard"] as const,
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
