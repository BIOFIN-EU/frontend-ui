// Workflow config and runtime state, mirroring physical-api
// (app/workflow_configs/workflows.json and the /api/case_workflow endpoints).
// Used by both the pathway (form) screens and the project dashboard.
import type { CaseDocument } from "./case-document";
import type { CaseLocationEntry } from "./case-location";

export type WorkflowFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "checkbox"
  | "file"
  | "hidden"
  | "content"
  | "assignment_table"
  | "location_table";

export type WorkflowFieldOption = {
  value: string;
  label: string;
};

export type WorkflowField = {
  name: string;
  display_name: string;
  type: WorkflowFieldType;
  // Omitted on display-only fields such as "content".
  required?: boolean;
  default?: string | number | boolean | null;
  options?: WorkflowFieldOption[];
  options_source?: string;
  widget?: string;
  content?: string;
  row_fields?: WorkflowField[];
  // Name of another field in the same row whose value filters this field's
  // lookup options (e.g. an intermediary's functions).
  filter_by?: string;
};

export type WorkflowUiMode =
  | "form"
  | "map_form"
  | "assignment_table"
  | "file_form"
  | "review"
  | "read_only"
  | "location_table";

export type WorkflowSubmitMode = "json" | "multipart" | "none";

export type WorkflowStep = {
  title: string;
  activity: string;
  next: string | null;
  fields: WorkflowField[];
  ui_mode?: WorkflowUiMode;
  submit_mode?: WorkflowSubmitMode;
};

export type WorkflowConfig = {
  code: string;
  name?: string;
  start_step: string;
  steps: Record<string, WorkflowStep>;
};

export type WorkflowStatus = "draft" | "in_progress" | "completed" | "failed";

export type WorkflowState = {
  case_id: number;
  // null once the workflow has completed.
  current_step: string | null;
  status: WorkflowStatus;
  step: WorkflowStep | null;
  validation_errors: Record<string, string | string[]>;
  workflow_code: string;
  documents: CaseDocument[];
  location: CaseLocationEntry[];
};

export type CreateWorkflowResponse = {
  case_id: number;
  workflow_id: string;
  workflow_code: string;
};

export type AvailableWorkflow = {
  code: string;
  title: string;
  description?: string;
};

export type SubmitStepResponse = {
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
