import { apiFetch } from "@/lib/api";
import type {
  CreateWorkflowResponse,
  WorkflowDocument,
  WorkflowState,
} from "@/types/case-dashboard";

const BASE = "/api/case_workflow";

type SubmitStepResponse = {
  message: string;
  state: WorkflowState;
};

export type EditStepResponse = {
  caseId: number;
  step: string;
  title: string;
  data: Record<string, unknown>;
};

export type StepDraftResponse = {
  data: Record<string, unknown> | null;
  updated_at: string | null;
};

export type DetectCountryRequest = {
  location_type: "polygon" | "point";
  geometry_wkt: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type DetectCountryResponse = {
  country_id: number;
  country_code: string;
  country_name: string;
  is_multiple: boolean;
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

  async editStep(
    caseId: number | string,
    stepCode: string,
    payload: Record<string, unknown>
  ): Promise<EditStepResponse> {
    return apiFetch<EditStepResponse>(
      `${BASE}/cases/${caseId}/steps/${stepCode}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  },

  async saveDraft(
    caseId: number | string,
    stepCode: string,
    data: Record<string, unknown>
  ): Promise<StepDraftResponse> {
    return apiFetch<StepDraftResponse>(
      `${BASE}/cases/${caseId}/steps/${stepCode}/draft`,
      {
        method: "PUT",
        body: JSON.stringify({ data }),
      }
    );
  },

  async getDraft(
    caseId: number | string,
    stepCode: string
  ): Promise<StepDraftResponse> {
    return apiFetch<StepDraftResponse>(
      `${BASE}/cases/${caseId}/steps/${stepCode}/draft`,
      { method: "GET" }
    );
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

  async detectCountry(
    payload: DetectCountryRequest
  ): Promise<DetectCountryResponse> {
    return apiFetch<DetectCountryResponse>(
      `${BASE}/locations/detect-country`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  extractErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return "Something went wrong";
  },
};