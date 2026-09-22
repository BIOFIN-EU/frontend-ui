"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { workflowService } from "@/services/workflow.service";
import { caseDashboardService } from "@/services/case-dashboard.service";
import type { WorkflowState, WorkflowStep } from "@/types/case-dashboard";
import type { CaseDashboardState, DashboardStep } from "@/types/workflow";
import { PathwayStepScreen } from "@/components/pathways/PathwayStepScreen";
import { PathwayStepper, buildOrderedSteps } from "@/components/pathways/PathwayStepper";

function dashboardStepToWorkflowStep(step: DashboardStep): WorkflowStep {
  return {
    title: step.title,
    activity: step.activity ?? "",
    next: step.next ?? null,
    fields: (step.fields ?? []) as unknown as WorkflowStep["fields"],
    ui_mode: step.ui_mode as WorkflowStep["ui_mode"],
    submit_mode: step.submit_mode as WorkflowStep["submit_mode"],
  };
}

function getCommittedStepData(
  dashboardState: CaseDashboardState | null,
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
  const { user } = useAuth();

  const [state, setState] = useState<WorkflowState | null>(null);
  const [dashboardState, setDashboardState] = useState<CaseDashboardState | null>(null);
  const [viewingStepCode, setViewingStepCode] = useState<string>("");
  const [draftData, setDraftData] = useState<unknown>(null);
  const [stepDataLoading, setStepDataLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadState() {
    try {
      setLoading(true);
      const data = await workflowService.getCaseState(caseId);
      setState(data);
      setViewingStepCode((current) => current || data.current_step);
      setError("");
    } catch (err) {
      console.error("load workflow state failed", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load workflow state");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard() {
    try {
      const data = await caseDashboardService.getCaseDashboard(caseId);
      setDashboardState(data);
    } catch (err) {
      console.error("load case dashboard failed", err);
    }
  }

  useEffect(() => {
    if (caseId && user) {
      loadState();
      loadDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, user]);

  const workflowConfig = dashboardState?.workflow_config ?? null;

  const stepConfig: WorkflowStep | null = useMemo(() => {
    if (!state) return null;

    if (!viewingStepCode || viewingStepCode === state.current_step) {
      return state.step;
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

  // Check for an existing draft for whichever step is being viewed (current
  // or a past one reached via the stepper), so unsaved progress survives a
  // refresh and edits prefill from the latest draft when one exists.
  useEffect(() => {
    let cancelled = false;

    async function loadDraft() {
      if (!caseId || !effectiveStepCode || !isDraftableStep) {
        setDraftData(null);
        return;
      }

      setStepDataLoading(true);

      try {
        const draft = await workflowService.getDraft(caseId, effectiveStepCode);
        if (!cancelled) {
          setDraftData(draft?.data ?? null);
        }
      } catch (err) {
        console.error("load step draft failed", err);
        if (!cancelled) setDraftData(null);
      } finally {
        if (!cancelled) setStepDataLoading(false);
      }
    }

    loadDraft();

    return () => {
      cancelled = true;
    };
  }, [caseId, effectiveStepCode, isDraftableStep]);

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
    setState(updated);
    setViewingStepCode(updated.current_step);
    loadDashboard();
  }

  function handleEditSaved() {
    if (!state) return;
    setViewingStepCode(state.current_step);
    setSavedMessage("Changes saved");
    loadDashboard();
    setTimeout(() => setSavedMessage(""), 2500);
  }

  if (!user) {
    return (
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Workflow
        </h1>
        <p className="text-sm text-white/70">Loading workflow access…</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
          Project #{caseId}
        </div>
      </header>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-white/70">
          Loading workflow...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && state && (
        <section className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {workflowConfig && (
            <PathwayStepper
              workflowConfig={workflowConfig}
              payload={dashboardState ?? {}}
              currentStepCode={state.current_step}
              activeStepCode={effectiveStepCode}
              onSelectStep={(code) => setViewingStepCode(code)}
            />
          )}

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
            {savedMessage && (
              <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
                {savedMessage}
              </div>
            )}

            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              {isEditMode ? "Editing step" : "Current step"}
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {stepConfig?.title ?? "Completed"}
            </h2>

            <div className="mt-6">
              {stepDataLoading ? (
                <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-sm text-white/60">
                  Loading step…
                </div>
              ) : (
                <PathwayStepScreen
                  key={`${effectiveStepCode}-${isEditMode ? "edit" : "submit"}`}
                  state={state}
                  onStateUpdated={handleStateUpdated}
                  onReload={loadState}
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
