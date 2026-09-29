import { apiFetch } from "@/lib/api";
import type {
  BngAllocation,
  BngFinancials,
  BngHabitatBank,
  BngTransaction,
  BngHabitatParcel,
  BngMetricSummary,
  BngReferenceData,
  BngMonitoring,
  BngMyAccess,
  BngReport,
  BngRole,
  BngSignoff,
  BngWaiting,
} from "@/types/bng";

const BASE = "/api/bng";

let referenceData: Promise<BngReferenceData> | null = null;

export const bngService = {
  // Fixed seed data: fetched once per page load.
  getReferenceData(): Promise<BngReferenceData> {
    if (!referenceData) {
      referenceData = apiFetch<BngReferenceData>(`${BASE}/reference-data`).catch((err) => {
        referenceData = null;
        throw err;
      });
    }
    return referenceData;
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

  // The marketplace inventory: registered banks with units still available.
  listHabitatBanks(): Promise<BngHabitatBank[]> {
    return apiFetch<BngHabitatBank[]>(`${BASE}/habitat-banks`);
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

  getCaseRoles(caseId: number | string): Promise<Record<string, BngRole[]>> {
    return apiFetch<Record<string, BngRole[]>>(`${BASE}/cases/${caseId}/roles`, { silent: true });
  },

  setUserRoles(caseId: number | string, userId: string, roles: BngRole[]): Promise<{ user_id: string; roles: BngRole[] }> {
    return apiFetch(`${BASE}/cases/${caseId}/roles/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ roles }),
    });
  },

  getSignoffs(caseId: number | string): Promise<BngSignoff[]> {
    return apiFetch<BngSignoff[]>(`${BASE}/cases/${caseId}/signoffs`);
  },

  getWaiting(): Promise<BngWaiting[]> {
    return apiFetch<BngWaiting[]>(`${BASE}/waiting`, { silent: true });
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
