import { api } from "@/lib/api";
import type { FormSchema, StepSchema, Progress } from "@/types/forms";

export async function getLatest(formId: string) {
  const res = await api.get(`/forms/${formId}/latest`);
  return res.data as { form_id: string; latest_version: string; versions: string[] };
}

export async function getFormVersion(formId: string, version: string) {
  const res = await api.get(`/forms/${formId}/versions/${version}`);
  return res.data as FormSchema;
}

export async function getStep(formId: string, version: string, step: number) {
  const res = await api.get(`/forms/${formId}/steps/${version}/${step}`);
  return res.data as StepSchema;
}

export async function getProgress(formId: string, version?: string) {
  const res = await api.get(`/me/progress/${formId}`, { params: { form_version: version } });
  return res.data as Progress;
}

export async function saveAnswers(formId: string, payload: { form_version: string; step: number; answers: Record<string, any> }) {
  const res = await api.post(`/responses/${formId}`, payload);
  return res.data as { ok: true; updated_at: string };
}
