export type CaseListItem = {
  caseId: number;
  name?: string | null;
  description?: string | null;
  caseType?: string | null;
  status?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt: string;
};