// Response of GET /api/case_workflow/cases/{caseId}/data (the project dashboard).
import type { CaseDocument } from "./case-document";
import type { CaseLocationEntry } from "./case-location";
import type { WorkflowConfig } from "./workflow";

export type CaseDashboardState = {
  caseId: number;
  caseType: string;
  caseTypeName?: string | null;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  workflow_config: WorkflowConfig;
  documents?: CaseDocument[];
  location?: CaseLocationEntry[];
  // Committed step data, keyed by step code.
  [key: string]: unknown;
};
