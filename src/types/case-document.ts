export type CaseDocument = {
  case_document_id: number;
  case_id: number;
  step_code: string;
  field_name: string;
  original_filename: string;
  upload_token: string;
  content_type: string;
  size_bytes: number;
  // A PDF or image, shown in the dashboard's viewer; anything else downloads.
  viewable: boolean;
  // What the uploader wrote about the file (the step's document_notes).
  notes: string | null;
  created_at: string;
};

