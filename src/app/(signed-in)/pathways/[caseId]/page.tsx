"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCaseDashboard } from "@/queries/projects";
import { useRefreshCaseData, useStepDraft, useWorkflowState, workflowKeys } from "@/queries/workflow";
import type { WorkflowState, WorkflowStep } from "@/types/workflow";
import type { CaseDashboardState } from "@/types/case-dashboard";
import { PathwayStepScreen } from "@/components/pathways/PathwayStepScreen";
import { PathwayStepper, buildOrderedSteps } from "@/components/pathways/PathwayStepper";
import { Alert } from "@/components/ui/Alert";

function dashboardStepToWorkflowStep(step: WorkflowStep): WorkflowStep {
  return {
    title: step.title,
    activity: step.activity ?? "",
    next: step.next ?? null,
    fields: (step.fields ?? []) as unknown as WorkflowStep["fields"],
    ui_mode: step.ui_mode as WorkflowStep["ui_mode"],
    submit_mode: step.submit_mode as WorkflowStep["submit_mode"],
    // Who may complete it (the step gate).
    roles: step.roles,
    allow_on_behalf: step.allow_on_behalf,
    approval: step.approval,
    stage: step.stage,
    actor: step.actor,
  };
}

/**
 * A running workflow keeps the step config it was started with, so help text
 * and roles added to the config later would never reach older cases. Take
 * each field's help_text / describe_options (including table row fields), and
 * who may complete the step (as the API checks it), from the current config.
 */
function withCurrentHelpText(step: WorkflowStep, current?: WorkflowStep): WorkflowStep {
  if (!current) return step;

  const currentFields = new Map(current.fields.map((field) => [field.name, field]));

  return {
    ...step,
    roles: current.roles,
    allow_on_behalf: current.allow_on_behalf,
    approval: current.approval,
    fields: step.fields.map((field) => {
      const latest = currentFields.get(field.name);
      if (!latest) return field;

      return {
        ...field,
        help_text: field.help_text ?? latest.help_text,
        describe_options: field.describe_options ?? latest.describe_options,
        entry_help_text: field.entry_help_text ?? latest.entry_help_text,
        row_fields: field.row_fields?.map((row) => ({
          ...row,
          help_text:
            row.help_text ??
            latest.row_fields?.find((latestRow) => latestRow.name === row.name)?.help_text,
        })),
      };
    }),
  };
}

function getCommittedStepData(
  dashboardState: CaseDashboardState | undefined,
  stepConfig: WorkflowStep | null,
  stepCode: string
): unknown {
  if (!dashboardState || !stepCode) return null;

  // Multi-location steps store their committed data under the top-level
  // `location` key regardless of the step's own code (see
  // ProjectDashboardScreen, which reads this same shape).
  if (stepConfig?.ui_mode === "location_table") {
    return Array.isArray(dashboardState.location) ? dashboardState.location : null;
  }

  return dashboardState[stepCode] ?? null;
}

export default function WorkflowCasePage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;
  const queryClient = useQueryClient();
  const refreshCaseData = useRefreshCaseData();

  const { data: state, isPending: loading, error } = useWorkflowState(caseId);
  // The case's saved data; shared with the project dashboard.
  const { data: dashboardState } = useCaseDashboard(caseId);
  // Empty means the current step.
  const [viewingStepCode, setViewingStepCode] = useState<string>("");
  const [savedMessage, setSavedMessage] = useState("");

  // ?step=<code> (e.g. from the BNG marketplace) opens that step, but only
  // the current step or one already saved; anything else is ignored.
  useEffect(() => {
    if (!state || !dashboardState) return;
    const requested = new URLSearchParams(window.location.search).get("step");
    if (!requested || requested === state.current_step) return;
    const saved = dashboardState[requested];
    if (saved != null && dashboardState.workflow_config?.steps?.[requested]) {
      setViewingStepCode(requested);
    }
    // Once, when both have loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(state), Boolean(dashboardState)]);

  const workflowConfig = dashboardState?.workflow_config ?? null;

  const stepConfig: WorkflowStep | null = useMemo(() => {
    if (!state) return null;

    if (!viewingStepCode || viewingStepCode === state.current_step) {
      if (!state.step) return null;
      const current = state.current_step ? workflowConfig?.steps?.[state.current_step] : undefined;
      return withCurrentHelpText(state.step, current);
    }

    const dashStep = workflowConfig?.steps?.[viewingStepCode];
    return dashStep ? dashboardStepToWorkflowStep(dashStep) : null;
  }, [state, viewingStepCode, workflowConfig]);

  const isEditMode = Boolean(
    state && viewingStepCode && viewingStepCode !== state.current_step
  );

  const isDraftableStep = Boolean(
    stepConfig && stepConfig.submit_mode !== "multipart"
  );

  const effectiveStepCode = viewingStepCode || state?.current_step || "";

  // The draft of whichever step is being viewed (current or a past one
  // reached via the stepper), so unsaved progress survives a refresh and
  // edits prefill from the latest draft when one exists.
  const draft = useStepDraft(caseId, effectiveStepCode, isDraftableStep);
  const stepDataLoading = draft.isLoading;
  const draftData = isDraftableStep ? (draft.data?.data ?? null) : null;
  const committedData = useMemo(
    () => getCommittedStepData(dashboardState, stepConfig, effectiveStepCode),
    [dashboardState, stepConfig, effectiveStepCode]
  );

  // A saved draft takes precedence over the last committed value.
  const initialValues = draftData ?? committedData ?? null;

  // Ordered step list (same chain the stepper walks) so the in-page "Back"
  // button can go to the immediately-previous step, same as clicking it in
  // the stepper would.
  const orderedSteps = useMemo(
    () => buildOrderedSteps(workflowConfig, dashboardState ?? {}, state?.current_step ?? ""),
    [workflowConfig, dashboardState, state]
  );
  const effectiveStepIndex = orderedSteps.findIndex((s) => s.code === effectiveStepCode);
  const previousStepCode =
    effectiveStepIndex > 0 ? orderedSteps[effectiveStepIndex - 1].code : null;

  function handleBack() {
    if (previousStepCode) setViewingStepCode(previousStepCode);
  }

  function handleStateUpdated(updated: WorkflowState) {
    queryClient.setQueryData(workflowKeys.state(caseId), updated);
    setViewingStepCode(updated.current_step ?? "");
    refreshCaseData(caseId);
  }

  function handleEditSaved() {
    if (!state) return;
    setViewingStepCode(state.current_step ?? "");
    setSavedMessage("Changes saved");
    refreshCaseData(caseId);
    setTimeout(() => setSavedMessage(""), 2500);
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="inline-flex w-fit items-center rounded-full bg-accent-500/15 px-3 py-1 text-xs font-semibold text-accent-200 ring-1 ring-accent-400/25">
          Project #{caseId}
        </div>
      </header>

      {loading && (
        <div className="rounded-2xl surface-panel p-6 text-fg/70">
          Loading workflow...
        </div>
      )}

      {error && (
        <Alert tone="danger">
          {error.message || "Failed to load workflow state"}
        </Alert>
      )}

      {state && (
        <section className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {workflowConfig && (
            <PathwayStepper
              workflowConfig={workflowConfig}
              payload={dashboardState ?? {}}
              currentStepCode={state.current_step ?? ""}
              activeStepCode={effectiveStepCode}
              onSelectStep={(code) => setViewingStepCode(code)}
            />
          )}

          <div className="rounded-2xl surface-panel p-6 shadow-panel">
            {savedMessage && (
              <Alert tone="success" className="mb-4">
                {savedMessage}
              </Alert>
            )}

            <p className="text-xs font-semibold uppercase tracking-wider text-fg/50">
              {isEditMode ? "Editing step" : "Current step"}
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
              {stepConfig?.title ?? "Completed"}
            </h2>

            <div className="mt-6">
              {stepDataLoading ? (
                <div className="rounded-xl surface-card p-6 text-sm text-fg/60">
                  Loading step…
                </div>
              ) : (
                <PathwayStepScreen
                  key={`${effectiveStepCode}-${isEditMode ? "edit" : "submit"}`}
                  state={state}
                  onStateUpdated={handleStateUpdated}
                  stepConfig={stepConfig}
                  stepCode={effectiveStepCode}
                  mode={isEditMode ? "edit" : "submit"}
                  initialValues={initialValues}
                  onEditSaved={handleEditSaved}
                  onBack={previousStepCode ? handleBack : undefined}
                  isFirstStep={!previousStepCode}
                />
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
