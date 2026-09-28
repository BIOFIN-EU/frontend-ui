import { apiFetch } from "@/lib/api";
import type { CaseDashboardState } from "@/types/case-dashboard";

const BASE = "/api/case_workflow/cases";

export const caseDashboardService = {
  async getCaseDashboard(caseId: number | string): Promise<CaseDashboardState> {
    return apiFetch<CaseDashboardState>(
      `${BASE}/${caseId}/data`,
      { method: "GET" }
    );
  },

  extractErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return "Failed to load case dashboard";
  },
};