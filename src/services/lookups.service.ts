import { apiFetch } from "@/lib/api";
import type { LookupOption } from "@/types/lookups";

const BASE = "/api/lookups";


export async function getLookupOptions(
  lookupKey: string,
  filters?: Record<string, string>
): Promise<LookupOption[]> {
  const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
  return apiFetch<LookupOption[]>(`${BASE}/${lookupKey}${query}`);
}