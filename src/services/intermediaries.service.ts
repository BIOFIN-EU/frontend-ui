import { apiFetch } from "@/lib/api";
import type {
  Intermediary,
  IntermediaryCreatePayload,
} from "@/types/intermediaries";

const BASE = "/api/intermediaries";

export async function listIntermediaries() {
  return apiFetch<Intermediary[]>(BASE);
}

export async function createIntermediary(payload: IntermediaryCreatePayload) {
  return apiFetch<Intermediary>(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}