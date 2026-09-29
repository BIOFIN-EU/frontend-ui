// BNG (Phase 3): keys the BNG step gate adds to a case's step submissions,
// e.g. that a project manager confirmed recording the step on behalf of the
// role that owns it. Nothing is ever set for other workflows, so their
// submissions are unchanged.
const extras = new Map<string, Record<string, unknown>>();

export function setBngSubmitExtras(caseId: number | string, values: Record<string, unknown> | null) {
  if (values) extras.set(String(caseId), values);
  else extras.delete(String(caseId));
}

export function bngSubmitExtras(caseId: number | string): Record<string, unknown> {
  return extras.get(String(caseId)) ?? {};
}
