"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { workflowService } from "@/services/workflow.service";
import type { WorkflowState } from "@/types/case-dashboard";
import { WorkflowStepScreen } from "@/components/workflow/WorkflowStepScreen";

export default function WorkflowCasePage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;
  const { user } = useAuth();

  const [state, setState] = useState<WorkflowState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadState() {
    try {
      setLoading(true);
      const data = await workflowService.getCaseState(caseId);
      setState(data);
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

  useEffect(() => {
    if (caseId && user) {
      loadState();
    }
  }, [caseId, user]);

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
          Case #{caseId}
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
        <>
          <section className="grid gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Current step
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {state.step?.title ?? "Completed"}
              </h2>

              <div className="mt-6">
                <WorkflowStepScreen
                  state={state}
                  onStateUpdated={setState}
                  onReload={loadState}
                />
              </div>
            </div>

          </section>
        </>
      )}
    </div>
  );
}