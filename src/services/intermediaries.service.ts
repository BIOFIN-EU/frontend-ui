import { apiFetch } from "@/lib/api";

const BASE = "/api/intermediaries";

export type IntermediaryFunctionAssignment = {
  id: number;
  intermediary_id: number;
  intermediary_function_id: number;
  intermediary_function_name?: string | null;
  intermediary_function_category?: string | null;
  created_at: string;
};

export type Intermediary = {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  contact_details?: string | null;
  notes?: string | null;
  functions: IntermediaryFunctionAssignment[];
  created_at: string;
  updated_at: string;
};

export type IntermediaryCreatePayload = {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_details?: string;
  notes?: string;
  function_ids: number[];
};

export async function listIntermediaries() {
  return apiFetch<Intermediary[]>(BASE);
}

export async function createIntermediary(payload: IntermediaryCreatePayload) {
  return apiFetch<Intermediary>(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}