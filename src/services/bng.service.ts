import { apiFetch } from "@/lib/api";
import type {
  BngAllocation,
  BngFinancials,
  BngHabitatBank,
  BngTransaction,
  BngHabitatParcel,
  BngMetricSummary,
  BngReferenceData,
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
  allocationAction(
    allocationId: number,
    action: "accept" | "decline" | "release"
  ): Promise<{ id: number; status: string }> {
    return apiFetch(`${BASE}/allocations/${allocationId}/${action}`, { method: "POST" });
  },
};
