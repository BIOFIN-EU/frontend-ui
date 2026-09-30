"use client";

// Data hooks for a pathway (workflow) case: its current state and step
// drafts. The case's saved data comes from useCaseDashboard in ./projects.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { workflowService } from "@/services/workflow.service";
import { projectKeys } from "@/queries/projects";
import { riskKeys } from "@/queries/risk";
import { bngKeys } from "@/queries/bng";

type CaseId = number | string;

export const workflowKeys = {
  state: (caseId: CaseId) => ["workflow", String(caseId), "state"] as const,
  draft: (caseId: CaseId, stepCode: string) => ["workflow", String(caseId), "draft", stepCode] as const,
};

/**
 * Where a case is in its workflow: current step and its config. Reloaded
 * whenever a page shows it, since other users (e.g. BNG roles) can move
 * the case on.
 */
export function useWorkflowState(caseId: CaseId) {
  return useQuery({
    queryKey: workflowKeys.state(caseId),
    queryFn: () => workflowService.getCaseState(caseId),
    enabled: Boolean(caseId),
    staleTime: 0,
  });
}

/**
 * The saved draft of a step. Never cached: drafts are saved as the user
 * types, so opening a step always loads its latest draft.
 */
export function useStepDraft(caseId: CaseId, stepCode: string, enabled: boolean) {
  return useQuery({
    queryKey: workflowKeys.draft(caseId, stepCode),
    queryFn: () => workflowService.getDraft(caseId, stepCode),
    enabled: enabled && Boolean(caseId && stepCode),
    staleTime: 0,
    gcTime: 0,
  });
}

/**
 * Call after anything about a case is saved (a step, a BNG action). All
 * project and BNG data is marked out of date, since some changes reach
 * other projects too (e.g. an allocation links a development and a habitat
 * bank). Only what is on screen reloads now; the rest when next shown. The
 * case's risk results (slow; they depend on its locations) reload too.
 */
export function useRefreshCaseData() {
  const queryClient = useQueryClient();
  // Resolves once what is on screen has reloaded.
  return (caseId: CaseId) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: projectKeys.all }),
      queryClient.invalidateQueries({ queryKey: bngKeys.all }),
      queryClient.invalidateQueries({ queryKey: riskKeys.case(caseId) }),
    ]);
}

/** Starts a new pathway, which creates a new project. */
export function useStartWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workflowCode: string) => workflowService.startWorkflow(workflowCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.list() }),
  });
}
