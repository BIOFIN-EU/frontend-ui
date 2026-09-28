export type CaseDocument = {
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

export type DocumentDownloadUrlResponse = {
  case_document_id: number;
  original_filename: string;
  download_url: string;
  expires_in_seconds: number;
};
