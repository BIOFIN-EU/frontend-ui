"use client";

import { useCallback, useEffect, useState } from "react";
import { bngService } from "@/services/bng.service";
import {
  BNG_MONITORING_STATUS_LABEL,
  formatDay,
  roleNames,
  type BngMonitoring,
  type BngMonitoringReport,
  type BngMonitoringStatus,
  type BngRole,
} from "@/types/bng";
import { buttonBaseSm, buttonGhost, buttonPrimary } from "@/lib/ui";
import { capacityFor, useBngMyAccess } from "./useBngMyAccess";
import { DatePicker } from "@/components/ui/DatePicker";

const BANK_ROLES: BngRole[] = ["landowner"];
const VERIFIER_ROLES: BngRole[] = ["ecologist", "lpa"];

const STATUS_STYLE: Record<BngMonitoringStatus, string> = {
  due: "bg-white/10 text-white/70 ring-white/10",
  submitted: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
  passed: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
  failed: "bg-red-500/15 text-red-200 ring-red-400/25",
  remediated: "bg-sky-500/15 text-sky-200 ring-sky-400/25",
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400";

/**
 * A registered habitat bank's 30-year monitoring (diagram steps 27-30):
 * the bank submits each report, an ecologist or the LPA verifies it, and a
 * failed report needs remedial actions.
 */
export function BngMonitoringCard({ caseId }: { caseId: number }) {
  const access = useBngMyAccess(caseId);
  const [monitoring, setMonitoring] = useState<BngMonitoring | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setMonitoring(await bngService.getMonitoring(caseId).catch(() => null));
  }, [caseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = monitoring?.summary;

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <h3 className="text-base font-semibold text-white">Monitoring and verification</h3>

      {!monitoring ? (
        <p className="mt-3 text-sm text-white/60">Loading…</p>
      ) : !summary?.scheduled ? (
        <p className="mt-3 text-sm text-white/60">
          Monitoring starts once the habitat bank is on the biodiversity gain site register. Reports are then due in
          years 1, 2, 5, 10, 15, 20, 25 and 30.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-white/65">
            {summary.next_due
              ? `Next report: year ${summary.next_due.year}, due ${formatDay(summary.next_due.due_date)}.`
              : "All reports are in."}
            {summary.counts.overdue > 0 && <span className="text-red-200"> {summary.counts.overdue} overdue.</span>}
            {summary.open_remedial_actions > 0 && (
              <span className="text-amber-200"> {summary.open_remedial_actions} remedial action(s) open.</span>
            )}
          </p>
          <ul className="mt-3 divide-y divide-white/10">
            {monitoring.reports.map((report) => (
              <li key={report.id} className="py-2">
                <button
                  type="button"
                  onClick={() => setOpenId(openId === report.id ? null : report.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-2 text-left text-sm"
                  aria-expanded={openId === report.id}
                >
                  <span className="text-white">
                    Year {report.year} <span className="text-white/50">· due {formatDay(report.due_date)}</span>
                    {report.overdue && <span className="ml-2 text-xs font-semibold text-red-200">Overdue</span>}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${STATUS_STYLE[report.status]}`}>
                    {BNG_MONITORING_STATUS_LABEL[report.status]}
                  </span>
                </button>
                {openId === report.id && (
                  <ReportDetail report={report} access={access} onChanged={load} />
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

type Access = ReturnType<typeof useBngMyAccess>;

function OnBehalfBox({ roles, checked, onChange }: { roles: BngRole[]; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-xs text-amber-100">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 accent-amber-400" />
      <span>This is for the {roleNames(roles)}. I am recording it on their behalf.</span>
    </label>
  );
}

function ReportDetail({ report, access, onChanged }: { report: BngMonitoringReport; access: Access; onChanged: () => Promise<void> }) {
  const bank = capacityFor(access, BANK_ROLES);
  const verifier = capacityFor(access, VERIFIER_ROLES);

  return (
    <div className="mt-3 space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
      {report.submitted_at && (
        <div className="space-y-1 text-white/75">
          <p>
            <span className="font-semibold text-white">Habitats on track:</span>{" "}
            {report.habitats_on_track ? "Yes" : "No"}
          </p>
          <p><span className="font-semibold text-white">Condition:</span> {report.condition_summary}</p>
          {report.management_carried_out && (
            <p><span className="font-semibold text-white">Management carried out:</span> {report.management_carried_out}</p>
          )}
          <p className="text-xs text-white/50">
            Submitted {formatDay(report.submitted_at)}
            {report.submitted_on_behalf && " by the project manager on behalf of the landowner"}
          </p>
        </div>
      )}

      {report.verified_at && (
        <div className="space-y-1 text-white/75">
          <p><span className="font-semibold text-white">Verification:</span> {report.verification_notes || "No notes"}</p>
          <p className="text-xs text-white/50">
            Verified {formatDay(report.verified_at)}
            {report.verified_on_behalf
              ? ` by the project manager on behalf of the ${report.verified_as_label}`
              : ` by the ${report.verified_as_label}`}
          </p>
        </div>
      )}

      {report.remedial_actions.length > 0 && (
        <RemedialActions report={report} capacity={bank} onChanged={onChanged} />
      )}

      {(report.status === "due" || report.status === "submitted") && bank.kind !== "none" && (
        <SubmitForm report={report} onBehalf={bank.kind === "on_behalf"} onChanged={onChanged} />
      )}

      {report.status === "submitted" && verifier.kind !== "none" && (
        <VerifyForm report={report} onBehalf={verifier.kind === "on_behalf"} onChanged={onChanged} />
      )}

      {report.status === "due" && bank.kind === "none" && (
        <p className="text-white/55">Waiting for the landowner to submit this report.</p>
      )}
      {report.status === "submitted" && verifier.kind === "none" && (
        <p className="text-white/55">Waiting for an ecologist or the Local Planning Authority to verify this report.</p>
      )}
    </div>
  );
}

function useAction(onChanged: () => Promise<void>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await onChanged();
    } catch (err: any) {
      const fields = err?.fieldErrors ? Object.values(err.fieldErrors).join(" ") : "";
      setError(fields || err?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, run };
}

function SubmitForm({ report, onBehalf, onChanged }: { report: BngMonitoringReport; onBehalf: boolean; onChanged: () => Promise<void> }) {
  const [onTrack, setOnTrack] = useState(report.habitats_on_track ?? true);
  const [condition, setCondition] = useState(report.condition_summary ?? "");
  const [management, setManagement] = useState(report.management_carried_out ?? "");
  const [confirmed, setConfirmed] = useState(false);
  const { busy, error, run } = useAction(onChanged);

  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <p className="font-semibold text-white">{report.status === "submitted" ? "Update the report" : "Submit the report"}</p>
      <label className="block space-y-1">
        <span className="text-xs text-white/70">Are the habitats on track to reach their target condition?</span>
        <select value={onTrack ? "yes" : "no"} onChange={(e) => setOnTrack(e.target.value === "yes")} className={inputClass}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-white/70">Habitat condition</span>
        <textarea value={condition} onChange={(e) => setCondition(e.target.value)} rows={3} className={inputClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-white/70">Management carried out (optional)</span>
        <textarea value={management} onChange={(e) => setManagement(e.target.value)} rows={2} className={inputClass} />
      </label>
      {onBehalf && <OnBehalfBox roles={BANK_ROLES} checked={confirmed} onChange={setConfirmed} />}
      {error && <p className="text-red-200">{error}</p>}
      <button
        type="button"
        disabled={busy || !condition.trim() || (onBehalf && !confirmed)}
        onClick={() =>
          run(() =>
            bngService.submitMonitoringReport(report.id, {
              habitats_on_track: onTrack,
              condition_summary: condition,
              management_carried_out: management || undefined,
              on_behalf: onBehalf,
            })
          )
        }
        className={`${buttonBaseSm} ${buttonPrimary} disabled:opacity-50`}
      >
        {busy ? "Saving…" : "Submit report"}
      </button>
    </div>
  );
}

function VerifyForm({ report, onBehalf, onChanged }: { report: BngMonitoringReport; onBehalf: boolean; onChanged: () => Promise<void> }) {
  const [outcome, setOutcome] = useState<"passed" | "failed">("passed");
  const [notes, setNotes] = useState("");
  const [actions, setActions] = useState([{ description: "", due_date: "" }]);
  const [confirmed, setConfirmed] = useState(false);
  const { busy, error, run } = useAction(onChanged);
  const filled = actions.filter((a) => a.description.trim());

  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <p className="font-semibold text-white">Verify the report</p>
      <label className="block space-y-1">
        <span className="text-xs text-white/70">Outcome</span>
        <select value={outcome} onChange={(e) => setOutcome(e.target.value as "passed" | "failed")} className={inputClass}>
          <option value="passed">Passed: the habitats are on track</option>
          <option value="failed">Failed: remedial action needed</option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-white/70">Notes</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
      </label>
      {outcome === "failed" && (
        <div className="space-y-2">
          <p className="text-xs text-white/70">Remedial actions the habitat bank must carry out</p>
          {actions.map((action, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[1fr_160px]">
              <input
                value={action.description}
                onChange={(e) => setActions(actions.map((a, i) => (i === index ? { ...a, description: e.target.value } : a)))}
                placeholder="What needs to be done"
                className={inputClass}
              />
              <DatePicker
                value={action.due_date}
                onChange={(iso) => setActions(actions.map((a, i) => (i === index ? { ...a, due_date: iso } : a)))}
                aria-label="Due date"
              />
            </div>
          ))}
          <button type="button" onClick={() => setActions([...actions, { description: "", due_date: "" }])} className={`${buttonBaseSm} ${buttonGhost}`}>
            Add action
          </button>
        </div>
      )}
      {onBehalf && <OnBehalfBox roles={VERIFIER_ROLES} checked={confirmed} onChange={setConfirmed} />}
      {error && <p className="text-red-200">{error}</p>}
      <button
        type="button"
        disabled={busy || (onBehalf && !confirmed) || (outcome === "failed" && filled.length === 0)}
        onClick={() =>
          run(() =>
            bngService.verifyMonitoringReport(report.id, {
              outcome,
              verification_notes: notes || undefined,
              remedial_actions:
                outcome === "failed"
                  ? filled.map((a) => ({ description: a.description, due_date: a.due_date || null }))
                  : [],
              on_behalf: onBehalf,
            })
          )
        }
        className={`${buttonBaseSm} ${buttonPrimary} disabled:opacity-50`}
      >
        {busy ? "Saving…" : "Save verification"}
      </button>
    </div>
  );
}

function RemedialActions({
  report,
  capacity,
  onChanged,
}: {
  report: BngMonitoringReport;
  capacity: ReturnType<typeof capacityFor>;
  onChanged: () => Promise<void>;
}) {
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const { busy, error, run } = useAction(onChanged);
  const onBehalf = capacity.kind === "on_behalf";
  const hasOpen = report.remedial_actions.some((a) => a.status === "open");

  return (
    <div className="space-y-2">
      <p className="font-semibold text-white">Remedial actions</p>
      <ul className="space-y-2">
        {report.remedial_actions.map((action) => (
          <li key={action.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <p className="text-white">
              {action.description}
              {action.due_date && <span className="text-white/50"> · by {formatDay(action.due_date)}</span>}
            </p>
            {action.status === "completed" ? (
              <p className="mt-1 text-xs text-emerald-200">
                Completed {formatDay(action.completed_at)}: {action.completion_notes}
              </p>
            ) : capacity.kind !== "none" ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  value={notes[action.id] ?? ""}
                  onChange={(e) => setNotes({ ...notes, [action.id]: e.target.value })}
                  placeholder="What was done"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  disabled={busy || !(notes[action.id] ?? "").trim() || (onBehalf && !confirmed)}
                  onClick={() =>
                    run(() =>
                      bngService.completeRemedialAction(action.id, {
                        completion_notes: notes[action.id] ?? "",
                        on_behalf: onBehalf,
                      })
                    )
                  }
                  className={`${buttonBaseSm} ${buttonPrimary} disabled:opacity-50`}
                >
                  Mark completed
                </button>
              </div>
            ) : (
              <p className="mt-1 text-xs text-amber-200">Open</p>
            )}
          </li>
        ))}
      </ul>
      {hasOpen && onBehalf && <OnBehalfBox roles={BANK_ROLES} checked={confirmed} onChange={setConfirmed} />}
      {error && <p className="text-red-200">{error}</p>}
    </div>
  );
}
