export type DashboardFieldOption = {
  value: string;
  label: string;
};

export type DashboardField = {
  name: string;
  display_name: string;
  type: string;
  required?: boolean;
  default?: string | number | boolean | null;
  options?: DashboardFieldOption[];
  options_source?: string;
  content?: string;
  row_fields?: DashboardField[];
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

export type CaseLocationCountry = {
  id: number;
  code: string;
  name: string;
};

export type CaseLocationEntry = {
  case_location_id: number;
  friendly_name: string | null;
  location_type: "polygon" | "point";
  geometry_wkt: string | null;
  latitude: number | null;
  longitude: number | null;
  area_sqm: number | null;
  area_hectares: number | null;
  area_is_manual: boolean;
  notes: string | null;
  country: CaseLocationCountry | null;
};

export type CaseDashboardState = {
  caseId: number;
  caseType: string;
  caseTypeName?: string | null;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  workflow_config: DashboardWorkflowConfig;
  documents?: DashboardDocument[];
  location?: CaseLocationEntry[];
  [key: string]: unknown;
};