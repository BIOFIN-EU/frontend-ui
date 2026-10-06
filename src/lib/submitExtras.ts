// Keys the step gate adds to a case's step submissions, e.g. that a project
// manager confirmed recording the step on behalf of the role that owns it.
// Nothing is set for steps without roles, so their submissions are unchanged.
const extras = new Map<string, Record<string, unknown>>();

export function setSubmitExtras(caseId: number | string, values: Record<string, unknown> | null) {
  if (values) extras.set(String(caseId), values);
  else extras.delete(String(caseId));
}

export function submitExtras(caseId: number | string): Record<string, unknown> {
  return extras.get(String(caseId)) ?? {};
}
