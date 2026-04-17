import { apiFetch } from "@/lib/api";

const BASE = "/api/lookups";

export type LookupOption = {
  value: string;
  label: string;
};

export async function getLookupOptions(
  lookupKey: string
): Promise<LookupOption[]> {
  return apiFetch<LookupOption[]>(`${BASE}/${lookupKey}`);
}