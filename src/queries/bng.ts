"use client";

// Data hooks for Biodiversity Net Gain (BNG) projects. Saves go through the
// pathway page or call useRefreshCaseData (./workflow), which marks all BNG
// data as out of date: only what is on screen reloads straight away.

import { useQuery } from "@tanstack/react-query";

import { bngService } from "@/services/bng.service";
import type { BngMyAccess } from "@/types/bng";

type CaseId = number | string;

export const bngKeys = {
  all: ["bng"] as const,
  reference: () => [...bngKeys.all, "reference"] as const,
  banks: () => [...bngKeys.all, "banks"] as const,
  waiting: () => [...bngKeys.all, "waiting"] as const,
  case: (caseId: CaseId) => [...bngKeys.all, "case", String(caseId)] as const,
  metric: (caseId: CaseId) => [...bngKeys.case(caseId), "metric"] as const,
  allocations: (caseId: CaseId) => [...bngKeys.case(caseId), "allocations"] as const,
  transactions: (caseId: CaseId) => [...bngKeys.case(caseId), "transactions"] as const,
  financials: (caseId: CaseId) => [...bngKeys.case(caseId), "financials"] as const,
  myAccess: (caseId: CaseId) => [...bngKeys.case(caseId), "my-access"] as const,
  roles: (caseId: CaseId) => [...bngKeys.case(caseId), "roles"] as const,
  monitoring: (caseId: CaseId) => [...bngKeys.case(caseId), "monitoring"] as const,
  report: (caseId: CaseId) => [...bngKeys.case(caseId), "report"] as const,
};

/** Habitat types, conditions etc.: fixed seed data, loaded once. */
export function useBngReferenceData() {
  return useQuery({
    queryKey: bngKeys.reference(),
    queryFn: () => bngService.getReferenceData(),
    staleTime: Infinity,
  });
}

/**
 * The marketplace inventory. Other developments can take units at any
 * time, so it reloads whenever it is shown.
 */
export function useHabitatBanks(enabled = true) {
  return useQuery({
    queryKey: bngKeys.banks(),
    queryFn: () => bngService.listHabitatBanks(),
    enabled,
    staleTime: 0,
  });
}

/** BNG steps across projects waiting for one of the user's roles. */
export function useBngWaiting() {
  return useQuery({ queryKey: bngKeys.waiting(), queryFn: () => bngService.getWaiting() });
}

export function useCaseMetric(caseId: CaseId) {
  return useQuery({ queryKey: bngKeys.metric(caseId), queryFn: () => bngService.getCaseMetric(caseId) });
}

export function useCaseAllocations(caseId: CaseId) {
  return useQuery({ queryKey: bngKeys.allocations(caseId), queryFn: () => bngService.getCaseAllocations(caseId) });
}

export function useCaseTransactions(caseId: CaseId) {
  return useQuery({ queryKey: bngKeys.transactions(caseId), queryFn: () => bngService.getCaseTransactions(caseId) });
}

/** A habitat bank's finances (only loaded for banks). */
export function useCaseFinancials(caseId: CaseId, enabled: boolean) {
  return useQuery({
    queryKey: bngKeys.financials(caseId),
    queryFn: () => bngService.getCaseFinancials(caseId),
    enabled,
  });
}

const NO_ACCESS: BngMyAccess = { roles: [], can_update: false, can_record_on_behalf: false };

/**
 * The current user's BNG roles on a project: null while loading, no roles
 * if the project isn't BNG (the request fails).
 */
export function useBngMyAccess(caseId: CaseId, enabled = true): BngMyAccess | null {
  const query = useQuery({
    queryKey: bngKeys.myAccess(caseId),
    queryFn: () => bngService.getMyAccess(caseId),
    enabled,
  });
  return query.data ?? (query.isError ? NO_ACCESS : null);
}

/** Each member's BNG roles (fails for a project that isn't BNG). */
export function useCaseRoles(caseId: CaseId) {
  return useQuery({ queryKey: bngKeys.roles(caseId), queryFn: () => bngService.getCaseRoles(caseId) });
}

export function useMonitoring(caseId: CaseId) {
  return useQuery({ queryKey: bngKeys.monitoring(caseId), queryFn: () => bngService.getMonitoring(caseId) });
}

export function useBngReport(caseId: CaseId) {
  return useQuery({ queryKey: bngKeys.report(caseId), queryFn: () => bngService.getReport(caseId) });
}
