import { apiFetch } from "@/lib/api";
import type { CaseListItem } from "@/types/case-list";

const BASE = "/api/case_workflow";

export const caseListService = {
  async getCases(): Promise<CaseListItem[]> {
    return apiFetch<CaseListItem[]>(
      `${BASE}/cases`,
      { method: "GET" }
    );
  },

  extractErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return "Failed to load cases";
  },
};