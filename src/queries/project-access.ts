"use client";

// Data hooks for who can do what on a project: its members, access levels
// and workflow roles, the current user's own access, and whose turn it is.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { projectAccessService } from "@/services/project-access.service";
import { bngKeys } from "@/queries/bng";
import type { AddMemberRequest, ChangeMemberRequest, ProjectMembers } from "@/types/project-access";

type CaseId = number | string;

export const accessKeys = {
  all: ["project-access"] as const,
  case: (caseId: CaseId) => [...accessKeys.all, String(caseId)] as const,
  members: (caseId: CaseId) => [...accessKeys.case(caseId), "members"] as const,
  history: (caseId: CaseId) => [...accessKeys.case(caseId), "history"] as const,
  mine: (caseId: CaseId) => [...accessKeys.case(caseId), "mine"] as const,
  waiting: () => [...accessKeys.all, "waiting"] as const,
  allCases: () => [...accessKeys.all, "all-cases"] as const,
};

/** The project's members, its roles and the access levels (Access tab). */
export function useProjectMembers(caseId: CaseId) {
  return useQuery({
    queryKey: accessKeys.members(caseId),
    queryFn: () => projectAccessService.getMembers(caseId),
    enabled: Boolean(caseId),
  });
}

/** The current user's level and roles on a project, and what they may do on each step. */
export function useMyAccess(caseId: CaseId) {
  return useQuery({
    queryKey: accessKeys.mine(caseId),
    queryFn: () => projectAccessService.getMyAccess(caseId),
    enabled: Boolean(caseId),
  });
}

/** Who changed whose access, newest first (managers only). */
export function useAccessHistory(caseId: CaseId, enabled: boolean) {
  return useQuery({
    queryKey: accessKeys.history(caseId),
    queryFn: () => projectAccessService.getHistory(caseId),
    enabled,
  });
}

/** Steps across projects waiting for one of the user's roles. */
export function useWaiting() {
  return useQuery({ queryKey: accessKeys.waiting(), queryFn: () => projectAccessService.getWaiting() });
}

/** Every project, for administrators; undefined (after a quiet 403) for everyone else. */
export function useAllCases() {
  return useQuery({
    queryKey: accessKeys.allCases(),
    queryFn: () => projectAccessService.getAllCases(),
    retry: false,
  });
}

/**
 * Member changes: each returns the updated member list, which replaces the
 * cached one; the user's own access, the history and whose turn it is may
 * have changed too.
 */
function useMemberMutation<T>(caseId: CaseId, change: (body: T) => Promise<ProjectMembers>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: change,
    onSuccess: (members) => {
      queryClient.setQueryData(accessKeys.members(caseId), members);
      void queryClient.invalidateQueries({ queryKey: accessKeys.mine(caseId) });
      void queryClient.invalidateQueries({ queryKey: accessKeys.history(caseId) });
      void queryClient.invalidateQueries({ queryKey: accessKeys.waiting() });
      void queryClient.invalidateQueries({ queryKey: bngKeys.myAccess(caseId) });
    },
  });
}

export function useAddMember(caseId: CaseId) {
  return useMemberMutation(caseId, (body: AddMemberRequest) => projectAccessService.addMember(caseId, body));
}

export function useChangeMember(caseId: CaseId) {
  return useMemberMutation(caseId, ({ userId, ...body }: ChangeMemberRequest & { userId: string }) =>
    projectAccessService.changeMember(caseId, userId, body)
  );
}

export function useRemoveMember(caseId: CaseId) {
  return useMemberMutation(caseId, (userId: string) => projectAccessService.removeMember(caseId, userId));
}

export function useTransferOwnership(caseId: CaseId) {
  return useMemberMutation(caseId, (userId: string) => projectAccessService.transferOwnership(caseId, userId));
}
