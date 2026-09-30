"use client";

// Options for select fields (/api/lookups). They rarely change, so they are
// kept for 10 minutes and shared by every step and row that uses them.

import { useCallback } from "react";
import { useQueries, type UseQueryResult } from "@tanstack/react-query";

import { getLookupOptions } from "@/services/lookups.service";
import type { LookupOption } from "@/types/lookups";

type Filters = Record<string, string>;

export const lookupKeys = {
  options: (source: string, filters: Filters = {}) => ["lookups", source, filters] as const,
};

export function lookupQuery(source: string, filters?: Filters) {
  return {
    queryKey: lookupKeys.options(source, filters),
    queryFn: () => getLookupOptions(source, filters),
    staleTime: 10 * 60_000,
  };
}

export type LookupRequest = { id: string; source: string; filters?: Filters };

/**
 * Options for several lookups at once, as { [id]: options }. An id is
 * undefined while its options load, and [] if they failed to load.
 */
export function useLookupOptions(requests: LookupRequest[]): Record<string, LookupOption[] | undefined> {
  // Stable while `requests` is, so the same object is returned until an
  // option list changes (callers memoize on it).
  const combine = useCallback(
    (results: UseQueryResult<LookupOption[]>[]) =>
      Object.fromEntries(
        results.map((result, i) => [requests[i].id, result.data ?? (result.isError ? [] : undefined)])
      ),
    [requests]
  );
  return useQueries({ queries: requests.map((r) => lookupQuery(r.source, r.filters)), combine });
}
