import { apiFetch } from "@/lib/api";

const BASE = "/api/intermediaries";

export type IntermediaryCreatePayload = {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_details?: string;
  notes?: string;
  function_ids: number[];
};

export async function createIntermediary(payload: IntermediaryCreatePayload) {
  return apiFetch(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}