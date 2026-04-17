export type DashboardField = {
  name: string;
  display_name: string;
  type: string;
  required?: boolean;
  default?: string | number | null;
  options_source?: string;
};

export type DashboardStep = {
  title: string;
  activity?: string;
  next?: string | null;
  ui_mode?: string;
  submit_mode?: string;
  fields?: DashboardField[];
};

export type DashboardWorkflowConfig = {
  code: string;
  start_step: string;
  steps: Record<string, DashboardStep>;
};

export type DashboardDocument = {
  case_document_id: number;
  case_id: number;
  step_code: string;
  field_name: string;
  original_filename: string;
  upload_token: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
};

export type CaseDashboardState = {
  caseId: number;
  caseType: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  workflow_config: DashboardWorkflowConfig;
  documents?: DashboardDocument[];
  [key: string]: unknown;
};