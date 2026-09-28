export type CaseListItem = {
  caseId: number;
  name?: string | null;
  description?: string | null;
  caseType?: string | null;
  caseTypeName?: string | null;
  status?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt: string;
  // The current user's can_delete on this case.
  canDelete?: boolean;
};