"use client";

// Data hooks for a pathway (workflow) case: its current state and step
// drafts. The case's saved data comes from useCaseDashboard in ./projects.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { workflowService } from "@/services/workflow.service";
import { projectKeys } from "@/queries/projects";
import { riskKeys } from "@/queries/risk";

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
 * Call after a step of a case is saved: its data, its risk results (which
 * depend on its locations) and the project list (which shows each
 * project's progress) are then loaded again.
 */
export function useRefreshCaseData() {
  const queryClient = useQueryClient();
  return (caseId: CaseId) => {
    queryClient.invalidateQueries({ queryKey: projectKeys.dashboard(caseId) });
    queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    queryClient.invalidateQueries({ queryKey: riskKeys.case(caseId) });
  };
}

/** Starts a new pathway, which creates a new project. */
export function useStartWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workflowCode: string) => workflowService.startWorkflow(workflowCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.list() }),
  });
}
