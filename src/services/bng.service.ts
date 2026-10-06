import { apiFetch } from "@/lib/api";
import type {
  BngAllocation,
  BngAllocationOptions,
  BngMarketplace,
  BngSuggestion,
  BngFinancials,
  BngTransaction,
  BngHabitatParcel,
  BngMetricSummary,
  BngReferenceData,
  BngMonitoring,
  BngMyAccess,
  BngReport,
  BngSignoff,
} from "@/types/bng";

const BASE = "/api/bng";

export const bngService = {
  // Fixed seed data (cached by useBngReferenceData).
  getReferenceData(): Promise<BngReferenceData> {
    return apiFetch<BngReferenceData>(`${BASE}/reference-data`);
  },

  getCaseMetric(caseId: number | string): Promise<BngMetricSummary> {
    return apiFetch<BngMetricSummary>(`${BASE}/cases/${caseId}/metric`);
  },

  // The metric with one phase's (unsaved) parcels, for a live preview.
  previewMetric(
    caseId: number | string,
    phase: "baseline" | "proposed",
    parcels: Pick<BngHabitatParcel, "parcel_name" | "habitat_type_id" | "condition_id" | "strategic_significance_id" | "size">[]
  ): Promise<BngMetricSummary> {
    return apiFetch<BngMetricSummary>(`${BASE}/cases/${caseId}/metric/preview`, {
      method: "POST",
      body: JSON.stringify({ phase, parcels }),
      silent: true,
    });
  },

  // The inventory, the user's developments and, for one, how each bank matches its need.
  getMarketplace(developmentId?: number | string): Promise<BngMarketplace> {
    const query = developmentId ? `?development_id=${developmentId}` : "";
    return apiFetch<BngMarketplace>(`${BASE}/marketplace${query}`);
  },

  // The reservation step's needed units and banks.
  getAllocationOptions(caseId: number | string): Promise<BngAllocationOptions> {
    return apiFetch<BngAllocationOptions>(`${BASE}/cases/${caseId}/allocation-options`);
  },

  // Banks ranked by how much of `need` they cover (silent: suggestions are optional).
  getAllocationSuggestions(
    caseId: number | string,
    need: Record<string, number>,
    excludeBankIds: number[]
  ): Promise<BngSuggestion[]> {
    return apiFetch<BngSuggestion[]>(`${BASE}/cases/${caseId}/allocation-suggestions`, {
      method: "POST",
      body: JSON.stringify({ need, exclude_bank_ids: excludeBankIds }),
      silent: true,
    });
  },

  getCaseAllocations(caseId: number | string): Promise<BngAllocation[]> {
    return apiFetch<BngAllocation[]>(`${BASE}/cases/${caseId}/allocations`);
  },

  getCaseTransactions(caseId: number | string): Promise<BngTransaction[]> {
    return apiFetch<BngTransaction[]>(`${BASE}/cases/${caseId}/transactions`);
  },

  getCaseFinancials(caseId: number | string): Promise<BngFinancials> {
    return apiFetch<BngFinancials>(`${BASE}/cases/${caseId}/financials`);
  },

  // accept / decline: the habitat bank; release: the development.
  // onBehalf: a project manager acting for the role that decides.
  allocationAction(
    allocationId: number,
    action: "accept" | "decline" | "release",
    onBehalf = false
  ): Promise<{ id: number; status: string }> {
    return apiFetch(`${BASE}/allocations/${allocationId}/${action}`, {
      method: "POST",
      body: JSON.stringify({ on_behalf: onBehalf }),
    });
  },

  // ---------- Phase 3 ----------

  // 404 for a project that isn't BNG: silent, callers treat it as "no roles".
  getMyAccess(caseId: number | string): Promise<BngMyAccess> {
    return apiFetch<BngMyAccess>(`${BASE}/cases/${caseId}/my-access`, { silent: true });
  },

  getSignoffs(caseId: number | string): Promise<BngSignoff[]> {
    return apiFetch<BngSignoff[]>(`${BASE}/cases/${caseId}/signoffs`);
  },

  getMonitoring(caseId: number | string): Promise<BngMonitoring> {
    return apiFetch<BngMonitoring>(`${BASE}/cases/${caseId}/monitoring`);
  },

  submitMonitoringReport(
    reportId: number,
    body: { habitats_on_track: boolean; condition_summary: string; management_carried_out?: string; on_behalf?: boolean }
  ) {
    return apiFetch(`${BASE}/monitoring-reports/${reportId}/submit`, { method: "POST", body: JSON.stringify(body) });
  },

  verifyMonitoringReport(
    reportId: number,
    body: {
      outcome: "passed" | "failed";
      verification_notes?: string;
      remedial_actions?: { description: string; due_date?: string | null }[];
      on_behalf?: boolean;
    }
  ) {
    return apiFetch(`${BASE}/monitoring-reports/${reportId}/verify`, { method: "POST", body: JSON.stringify(body) });
  },

  completeRemedialAction(actionId: number, body: { completion_notes: string; on_behalf?: boolean }) {
    return apiFetch(`${BASE}/remedial-actions/${actionId}/complete`, { method: "POST", body: JSON.stringify(body) });
  },

  getReport(caseId: number | string): Promise<BngReport> {
    return apiFetch<BngReport>(`${BASE}/cases/${caseId}/report`);
  },
};
