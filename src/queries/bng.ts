"use client";

// Data hooks for Biodiversity Net Gain (BNG) projects. Saves go through the
// pathway page or call useRefreshCaseData (./workflow), which marks all BNG
// data as out of date: only what is on screen reloads straight away.

import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { bngService } from "@/services/bng.service";
import type { BngCategory, BngMyAccess, BngRole } from "@/types/bng";

type CaseId = number | string;

export const bngKeys = {
  all: ["bng"] as const,
  reference: () => [...bngKeys.all, "reference"] as const,
  marketplace: (developmentId: string) => [...bngKeys.all, "marketplace", developmentId] as const,
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
  allocationOptions: (caseId: CaseId) => [...bngKeys.case(caseId), "allocation-options"] as const,
  suggestions: (caseId: CaseId, need: Record<string, number>, exclude: number[]) =>
    [...bngKeys.case(caseId), "suggestions", need, exclude] as const,
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
 * How BNG codes are shown (roles, categories, statuses), from the API. A
 * code is shown as-is until the reference data has loaded.
 */
export function useBngLabels() {
  const vocabulary = useBngReferenceData().data?.vocabulary;
  return useMemo(() => {
    const roles = vocabulary?.roles ?? [];
    const roleLabel = new Map(roles.map((r) => [r.code, r.label]));
    const categories = new Map((vocabulary?.categories ?? []).map((c) => [c.code, c]));
    const role = (code: string | null | undefined) => (code ? (roleLabel.get(code as BngRole) ?? code) : "");
    return {
      roles,
      role,
      /** "Developer", "Developer or LPA", "Developer, Ecologist or LPA". */
      roleNames(codes: string[] | undefined) {
        const labels = (codes ?? []).map(role);
        return labels.length <= 1 ? labels.join("") : `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}`;
      },
      category: (code: BngCategory) => categories.get(code)?.label ?? code,
      sizeUnit: (code: BngCategory) => categories.get(code)?.size_unit ?? "",
      unitName: (code: BngCategory) => categories.get(code)?.unit_name ?? "",
      allocationStatus: (code: string) => vocabulary?.allocation_statuses[code as keyof typeof vocabulary.allocation_statuses] ?? code,
      monitoringStatus: (code: string) => vocabulary?.monitoring_statuses[code as keyof typeof vocabulary.monitoring_statuses] ?? code,
      signoffDecision: (code: string) =>
        vocabulary?.signoff_decisions[code as keyof typeof vocabulary.signoff_decisions] ?? code,
      revenueParties: Object.entries(vocabulary?.revenue_parties ?? {}).map(([code, label]) => ({ code, label })),
    };
  }, [vocabulary]);
}

/**
 * The marketplace: the inventory, the user's developments and, for the
 * chosen one ("" = none), how well each bank covers its need. Other
 * developments can take units at any time, so it reloads whenever shown.
 */
export function useMarketplace(developmentId: string) {
  return useQuery({
    queryKey: bngKeys.marketplace(developmentId),
    queryFn: () => bngService.getMarketplace(developmentId || undefined),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

/** For a development's reservation step: the units needed and the banks, with their limits. */
export function useAllocationOptions(caseId: CaseId) {
  return useQuery({
    queryKey: bngKeys.allocationOptions(caseId),
    queryFn: () => bngService.getAllocationOptions(caseId),
    staleTime: 0,
  });
}

/** `value`, once it has stopped changing for `ms`. */
function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

/**
 * Banks ranked by how much of `need` they cover, leaving out `exclude`
 * (banks already in the form). Asked for shortly after the form stops
 * changing; the last suggestions stay shown meanwhile.
 */
export function useAllocationSuggestions(caseId: CaseId, need: Record<string, number>, exclude: number[], enabled: boolean) {
  const key = useDebounced(JSON.stringify([need, [...exclude].sort((a, b) => a - b)]), 300);
  const [debouncedNeed, debouncedExclude] = JSON.parse(key) as [Record<string, number>, number[]];
  return useQuery({
    queryKey: bngKeys.suggestions(caseId, debouncedNeed, debouncedExclude),
    queryFn: () => bngService.getAllocationSuggestions(caseId, debouncedNeed, debouncedExclude),
    enabled,
    placeholderData: keepPreviousData,
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
