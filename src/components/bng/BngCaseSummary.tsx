"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { bngService } from "@/services/bng.service";
import { FileText } from "lucide-react";
import {
  BNG_REVENUE_PARTY_LABEL,
  formatDay,
  formatMoney,
  roleNames,
  type BngAllocation,
  type BngFinancials,
  type BngMetricSummary,
  type BngRevenueParty,
  type BngRole,
  type BngTransaction,
} from "@/types/bng";
import type { WorkflowStep } from "@/types/workflow";
import { BngMetricPanel } from "./BngMetricPanel";
import { AllocationStatusBadge } from "./AllocationStatusBadge";
import { unitsLine } from "./BngDashboardCards";
import { BngMonitoringCard } from "./BngMonitoringCard";
import { BngSignoffsCard } from "./BngSignoffsCard";
import { capacityFor, useBngMyAccess } from "./useBngMyAccess";
import { buttonBaseSm, buttonGhost, buttonPrimary } from "@/lib/ui";

type Props = {
  caseId: number;
  summary?: BngMetricSummary;
  // For the sign-off history: step titles and the recorded sign-offs.
  steps?: Record<string, WorkflowStep>;
  signoffs?: unknown;
};

// Who decides on reservation requests, per side (see bng_marketplace.py).
const DECIDING_ROLES: Record<"habitat_bank" | "development", BngRole[]> = {
  habitat_bank: ["landowner", "investor"],
  development: ["developer"],
};

const card = "rounded-2xl border border-white/10 bg-black/20 p-5";

/**
 * The BNG part of the project dashboard: the metric, the marketplace
 * requests / allocations, a habitat bank's finances and the transactions.
 */
export function BngCaseSummary({ caseId, summary, steps, signoffs }: Props) {
  const isBank = summary?.role === "habitat_bank";
  const access = useBngMyAccess(caseId);
  const deciding = DECIDING_ROLES[isBank ? "habitat_bank" : "development"];
  const capacity = capacityFor(access, deciding);
  const [onBehalf, setOnBehalf] = useState(false);
  const canDecide = capacity.kind === "own" || (capacity.kind === "on_behalf" && onBehalf);
  const [allocations, setAllocations] = useState<BngAllocation[] | null>(null);
  const [transactions, setTransactions] = useState<BngTransaction[] | null>(null);
  const [financials, setFinancials] = useState<BngFinancials | null>(null);
  const [metric, setMetric] = useState<BngMetricSummary | undefined>(summary);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [nextAllocations, nextTransactions] = await Promise.all([
      bngService.getCaseAllocations(caseId).catch(() => []),
      bngService.getCaseTransactions(caseId).catch(() => []),
    ]);
    setAllocations(nextAllocations);
    setTransactions(nextTransactions);
    if (isBank) setFinancials(await bngService.getCaseFinancials(caseId).catch(() => null));
  }, [caseId, isBank]);

  useEffect(() => {
    setMetric(summary);
  }, [summary]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(allocation: BngAllocation, action: "accept" | "decline" | "release") {
    if (allocation.id == null) return;
    setError("");
    setBusyId(allocation.id);
    try {
      await bngService.allocationAction(allocation.id, action, capacity.kind === "on_behalf");
      await load();
      setMetric(await bngService.getCaseMetric(caseId).catch(() => metric));
    } catch (err: any) {
      setError(err?.message || "Could not update the request.");
    } finally {
      setBusyId(null);
    }
  }

  const open = (allocations ?? []).filter((a) => a.status !== "declined" && a.status !== "released");
  const closed = (allocations ?? []).filter((a) => a.status === "declined" || a.status === "released");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href={`/bng/report/${caseId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold !text-emerald-200 hover:!text-emerald-100"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Open project report
        </Link>
      </div>

      <BngMetricPanel summary={metric} />

      {isBank && financials && <FinancialsCard financials={financials} />}

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-white">
            {isBank ? "Reservation requests and allocations" : "Off-site units"}
          </h3>
          <Link href="/bng/marketplace" className="text-sm font-semibold !text-emerald-200 hover:!text-emerald-100">
            Marketplace →
          </Link>
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</p>
        )}

        {capacity.kind === "on_behalf" && open.some((a) => (isBank ? a.status === "requested" : a.status === "requested" || a.status === "reserved")) && (
          <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-500/10 p-3 text-sm text-amber-50">
            <input type="checkbox" checked={onBehalf} onChange={(e) => setOnBehalf(e.target.checked)} className="mt-0.5 h-4 w-4 accent-amber-400" />
            <span>
              These decisions are for the {roleNames(deciding)}. I am recording them on their behalf.
            </span>
          </label>
        )}

        {allocations === null ? (
          <p className="mt-3 text-sm text-white/60">Loading…</p>
        ) : open.length === 0 ? (
          <p className="mt-3 text-sm text-white/60">
            {isBank ? "No developments have requested units from this habitat bank yet." : "No off-site units requested."}
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-white/10">
            {open.map((allocation) => {
              const otherName = isBank ? allocation.development_name : allocation.habitat_bank_name;
              const busy = busyId === allocation.id;
              return (
                <li key={allocation.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">
                        {otherName ?? (isBank ? "Development" : "Habitat bank")}
                      </span>
                      {allocation.status && <AllocationStatusBadge status={allocation.status} />}
                    </div>
                    <p className="text-white/70 tabular-nums">
                      {unitsLine(allocation)}
                      {allocation.total_price != null && ` · ${formatMoney(allocation.total_price)}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {canDecide && isBank && allocation.status === "requested" && (
                      <>
                        <button type="button" disabled={busy} onClick={() => act(allocation, "accept")} className={`${buttonBaseSm} ${buttonPrimary} disabled:opacity-60`}>
                          Accept
                        </button>
                        <button type="button" disabled={busy} onClick={() => act(allocation, "decline")} className={`${buttonBaseSm} ${buttonGhost} disabled:opacity-60`}>
                          Decline
                        </button>
                      </>
                    )}
                    {canDecide && !isBank && (allocation.status === "requested" || allocation.status === "reserved") && (
                      <button type="button" disabled={busy} onClick={() => act(allocation, "release")} className={`${buttonBaseSm} ${buttonGhost} disabled:opacity-60`}>
                        Release
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {closed.length > 0 && (
          <p className="mt-3 text-xs text-white/50">
            {closed.length} earlier request{closed.length === 1 ? "" : "s"} declined or released.
          </p>
        )}
      </section>

      <TransactionsCard transactions={transactions} isBank={isBank} />

      {isBank && <BngMonitoringCard caseId={caseId} />}

      <BngSignoffsCard
        titles={Object.fromEntries(Object.entries(steps ?? {}).map(([code, step]) => [code, step.title]))}
        signoffs={signoffs}
      />
    </div>
  );
}

function FinancialsCard({ financials }: { financials: BngFinancials }) {
  const items: [string, number | null, string][] = [
    ["Potential revenue", financials.potential_revenue, "All uplift units sold at your prices"],
    ["Committed revenue", financials.committed_revenue, "Allocated and retired units"],
    ["Pipeline", financials.pipeline_revenue, "Requested and reserved units"],
    ["Delivery cost", financials.delivery_cost, "Cost of creating and managing the habitats"],
    ["Potential margin", financials.potential_margin, "Potential revenue minus delivery cost"],
  ];
  return (
    <section className={card}>
      <h3 className="text-base font-semibold text-white">Finances</h3>
      {!financials.prices_set && (
        <p className="mt-2 text-sm text-amber-200">Set your unit prices in the Unit Pricing step to see revenue.</p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map(([label, value, hint]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-white">{formatMoney(value)}</p>
            <p className="text-xs text-white/50">{hint}</p>
          </div>
        ))}
      </div>
      <RevenueSplit financials={financials} />
    </section>
  );
}

function RevenueSplit({ financials }: { financials: BngFinancials }) {
  const shares = financials.revenue_shares;
  const distribution = financials.revenue_distribution;
  if (!shares && !distribution?.retired_revenue) {
    return (
      <p className="mt-4 text-sm text-white/55">
        Set the revenue split (landowner, investor, habitat manager) in the Unit Pricing step.
      </p>
    );
  }
  const parties = Object.keys(BNG_REVENUE_PARTY_LABEL) as BngRevenueParty[];
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/45">Revenue split</p>
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-white/50">
          <tr>
            <th className="py-1.5 pr-3 font-semibold">Party</th>
            <th className="py-1.5 pr-3 text-right font-semibold">Current share</th>
            <th className="py-1.5 text-right font-semibold">Earned from retired units</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-white/85">
          {parties.map((party) => (
            <tr key={party}>
              <td className="py-2 pr-3">{BNG_REVENUE_PARTY_LABEL[party]}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{shares ? `${shares[party]}%` : "—"}</td>
              <td className="py-2 text-right tabular-nums">{formatMoney(distribution?.distributed[party] ?? null)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(distribution?.not_split ?? 0) > 0 && (
        <p className="mt-2 text-xs text-white/50">
          {formatMoney(distribution?.not_split ?? null)} was sold before a split was set and isn&apos;t divided.
        </p>
      )}
    </div>
  );
}

function TransactionsCard({ transactions, isBank }: { transactions: BngTransaction[] | null; isBank: boolean }) {
  return (
    <section className={card}>
      <h3 className="text-base font-semibold text-white">Transactions</h3>
      {!transactions || transactions.length === 0 ? (
        <p className="mt-3 text-sm text-white/60">
          None yet. A transaction is recorded when the development&apos;s gain plan is approved.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-white/10 text-sm">
          {transactions.map((transaction) => {
            const otherName = isBank ? transaction.development_name : transaction.habitat_bank_name;
            return (
              <li key={transaction.reference} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <div>
                  <p className="font-mono text-white">{transaction.reference}</p>
                  <p className="text-white/60">
                    {otherName ?? (isBank ? "Development" : "Habitat bank")}
                    {transaction.created_at && ` · ${formatDay(transaction.created_at)}`}
                  </p>
                </div>
                <p className="text-white/75 tabular-nums">
                  {unitsLine(transaction)} · <span className="font-semibold text-white">{formatMoney(transaction.total_price)}</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
