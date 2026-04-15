import { apiFetch } from "@/lib/api";
import type {
  CreateWorkflowResponse,
  WorkflowDocument,
  WorkflowState,
} from "@/types/workflow";

const BASE = "/api/case_workflow";

type SubmitStepResponse = {
  message: string;
  state: WorkflowState;
};

export const workflowService = {
  async startWorkflow(workflowCode: string): Promise<CreateWorkflowResponse> {
    const query = new URLSearchParams({ workflow_code: workflowCode }).toString();

    return apiFetch<CreateWorkflowResponse>(
      `${BASE}/cases/start?${query}`,
      { method: "POST" }
    );
  },

  async getCaseState(caseId: number | string): Promise<WorkflowState> {
    return apiFetch<WorkflowState>(
      `${BASE}/cases/${caseId}/state`,
      { method: "GET" }
    );
  },

  async submitJsonStep(
    caseId: number | string,
    values: Record<string, unknown>
  ): Promise<WorkflowState> {
    const response = await apiFetch<SubmitStepResponse>(
      `${BASE}/cases/${caseId}/submit-json`,
      {
        method: "POST",
        body: JSON.stringify(values),
      }
    );

    return response.state;
  },

  async submitFileStep(args: {
    caseId: number | string;
    fieldName: string;
    file: File;
  }): Promise<WorkflowState> {
    const formData = new FormData();
    formData.append("file", args.file);

    const query = new URLSearchParams({ field_name: args.fieldName }).toString();

    const response = await apiFetch<SubmitStepResponse>(
      `${BASE}/cases/${args.caseId}/submit-file?${query}`,
      {
        method: "POST",
        body: formData,
        headers: {},
      }
    );

    return response.state;
  },

  async listCaseDocuments(caseId: number | string): Promise<WorkflowDocument[]> {
    return apiFetch<WorkflowDocument[]>(
      `${BASE}/cases/${caseId}/documents`,
      { method: "GET" }
    );
  },

  async getDocumentDownloadUrl(
    caseId: number | string,
    caseDocumentId: number | string
  ) {
    return apiFetch(
      `${BASE}/cases/${caseId}/documents/${caseDocumentId}/download-url`,
      { method: "GET" }
    );
  },

  extractErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return "Something went wrong";
  },
};