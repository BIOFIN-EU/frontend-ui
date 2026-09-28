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

  // Soft delete (requires can_delete). Silent: the confirm dialog shows the
  // error itself instead of the global toast.
  async deleteCase(caseId: number | string): Promise<void> {
    await apiFetch<null>(`${BASE}/cases/${caseId}`, {
      method: "DELETE",
      silent: true,
    });
  },

  extractErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return "Failed to load cases";
  },
};