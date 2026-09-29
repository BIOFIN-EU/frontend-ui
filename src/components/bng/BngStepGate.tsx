"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ShieldCheck, UserCheck, Clock } from "lucide-react";
import { workflowService } from "@/services/workflow.service";
import { setBngSubmitExtras } from "@/lib/bngSubmitExtras";
import { BNG_ROLE_LABEL, roleNames, type BngRole } from "@/types/bng";
import type { WorkflowState, WorkflowStep } from "@/types/workflow";
import { buttonBase, buttonBaseSm, buttonDanger, buttonGhost } from "@/lib/ui";
import { capacityFor, useBngMyAccess } from "./useBngMyAccess";

type Props = {
  state: WorkflowState;
  step: WorkflowStep;
  mode: "submit" | "edit";
  onStateUpdated: (state: WorkflowState) => void;
  children: ReactNode;
};

/**
 * BNG steps with "roles": shows the step to users holding one of them; a
 * project manager must first confirm they record it on the role's behalf;
 * anyone else sees whose turn it is. Approval steps also get Reject.
 */
export function BngStepGate({ state, step, mode, onStateUpdated, children }: Props) {
  const access = useBngMyAccess(state.case_id);
  const [onBehalf, setOnBehalf] = useState(false);
  const capacity = capacityFor(access, step.roles, step.allow_on_behalf);
  const owners = roleNames(step.roles);

  useEffect(() => {
    setBngSubmitExtras(state.case_id, onBehalf && capacity.kind === "on_behalf" ? { _bng_on_behalf: true } : null);
    return () => setBngSubmitExtras(state.case_id, null);
  }, [state.case_id, onBehalf, capacity.kind]);

  if (access === null) {
    return <p className="text-sm text-white/60">Checking your role on this project…</p>;
  }

  if (capacity.kind === "none") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/75">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
        <div>
          <p className="font-semibold text-white">Waiting for the {owners}</p>
          <p className="mt-1">
            Only the {owners} can {mode === "edit" ? "change" : "complete"} this step. Ask the project owner to give you
            that role on the Access tab if it should be you.
          </p>
        </div>
      </div>
    );
  }

  const roleLabel = BNG_ROLE_LABEL[capacity.role as BngRole] ?? capacity.role;
  const canAct = capacity.kind === "own" || onBehalf;

  return (
    <div className="space-y-4">
      {capacity.kind === "own" ? (
        <p className="flex items-center gap-2 text-sm text-emerald-200">
          <UserCheck className="h-4 w-4" aria-hidden="true" />
          You are completing this step as {roleLabel}.
        </p>
      ) : (
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm text-amber-50">
          <input
            type="checkbox"
            checked={onBehalf}
            onChange={(e) => setOnBehalf(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-amber-400"
          />
          <span>
            <span className="font-semibold">This step is for the {owners}.</span> I am recording their decision on
            their behalf. It will be shown as recorded on behalf of the {roleLabel}.
          </span>
        </label>
      )}

      {canAct && children}

      {canAct && mode === "submit" && step.approval && (
        <RejectPanel state={state} step={step} onStateUpdated={onStateUpdated} />
      )}
    </div>
  );
}

function RejectPanel({
  state,
  step,
  onStateUpdated,
}: {
  state: WorkflowState;
  step: WorkflowStep;
  onStateUpdated: (state: WorkflowState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const target = step.approval?.reject_label ?? "an earlier step";

  async function reject() {
    if (!reason.trim()) {
      setError("Say why this is being rejected.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      onStateUpdated(
        await workflowService.submitJsonStep(state.case_id, { _decision: "rejected", _rejection_comment: reason })
      );
    } catch (err: any) {
      setError(err?.fieldErrors?._rejection_comment || err?.message || "Could not reject the step.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.06] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-white/80">
          <ShieldCheck className="h-4 w-4 text-red-300" aria-hidden="true" />
          Not approved? Reject it and the project goes back to {target}.
        </p>
        {!open && (
          <button type="button" onClick={() => setOpen(true)} className={`${buttonBaseSm} ${buttonGhost}`}>
            Reject…
          </button>
        )}
      </div>
      {open && (
        <div className="mt-4 space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-white/70">Reason for rejecting</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={2000}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-red-400"
            />
          </label>
          {error && <p className="text-sm text-red-200">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setOpen(false)} disabled={busy} className={`${buttonBase} ${buttonGhost}`}>
              Cancel
            </button>
            <button type="button" onClick={reject} disabled={busy} className={`${buttonBase} ${buttonDanger} disabled:opacity-60`}>
              {busy ? "Rejecting…" : `Reject and return to ${target}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
