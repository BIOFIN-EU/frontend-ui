import { apiFetch } from "@/lib/api";
import type { LookupOption } from "@/types/lookups";

const BASE = "/api/lookups";


export async function getLookupOptions(
  lookupKey: string
): Promise<LookupOption[]> {
  return apiFetch<LookupOption[]>(`${BASE}/${lookupKey}`);
}