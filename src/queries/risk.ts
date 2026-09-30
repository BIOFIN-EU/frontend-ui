"use client";

import { useQuery } from "@tanstack/react-query";

import * as riskService from "@/services/risk.service";

export const riskKeys = {
  case: (caseId: number | string) => ["risk", String(caseId)] as const,
};

/**
 * Risk results and priority actions for every location of a project, in
 * location order. Slow to compute, so kept for 5 minutes; saving a pathway
 * step refreshes it (useRefreshCaseData).
 */
export function useCaseRisk(caseId: number | string) {
  return useQuery({
    queryKey: riskKeys.case(caseId),
    queryFn: () => riskService.getPriorityManagementActionsByCaseID(String(caseId)),
    enabled: Boolean(caseId),
    staleTime: 5 * 60_000,
  });
}
