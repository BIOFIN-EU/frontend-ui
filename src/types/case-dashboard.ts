export type WorkflowFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "file"
  | "hidden"
  | "assignment_table"
  | "location_table";

export type WorkflowFieldOption = {
  value: string;
  label: string;
};

export type WorkflowField = {
  name: string;
  display_name: any;
  type: WorkflowFieldType;
  required: boolean;
  default?: string | number | boolean | null;
  options?: WorkflowFieldOption[];
  options_source?: string;
  widget?: string;
};

export type WorkflowStep = {
  title: string;
  activity: string;
  next: string | null;
  fields: WorkflowField[];
  ui_mode?:
    | "form"
    | "map_form"
    | "assignment_table"
    | "file_form"
    | "review"
    | "read_only"
    | "location_table";
  submit_mode?: "json" | "multipart" | "none";
};

export type WorkflowDocument = {
  id: number;
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

export type WorkflowState = {
  case_id: number;
  current_step: string;
  status: "running" | "completed" | "failed";
  step: WorkflowStep | null;
  validation_errors: Record<string, string | string[]>;
  workflow_code: string;
  documents: WorkflowDocument[];
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