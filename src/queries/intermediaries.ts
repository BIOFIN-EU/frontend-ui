"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createIntermediary, listIntermediaries } from "@/services/intermediaries.service";
import type { IntermediaryCreatePayload } from "@/types/intermediaries";

export const intermediaryKeys = {
  list: () => ["intermediaries", "list"] as const,
};

export function useIntermediaries() {
  return useQuery({
    queryKey: intermediaryKeys.list(),
    queryFn: () => listIntermediaries(),
  });
}

export function useCreateIntermediary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IntermediaryCreatePayload) => createIntermediary(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: intermediaryKeys.list() });
      // Intermediaries are also select options (e.g. pathway assignments).
      queryClient.invalidateQueries({ queryKey: ["lookups"] });
    },
  });
}
