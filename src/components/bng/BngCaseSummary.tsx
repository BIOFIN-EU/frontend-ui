"use client";

import Link from "next/link";
import { useState } from "react";
import { bngService } from "@/services/bng.service";
import { FileText } from "lucide-react";
import {
  formatDay,
  formatMoney,
  type BngAllocation,
  type BngCapacity,
  type BngFinancials,
  type BngMetricSummary,
  type BngRevenueParty,
  type BngTransaction,
} from "@/types/bng";
import type { WorkflowStep } from "@/types/workflow";
import { BngMetricPanel } from "./BngMetricPanel";
import { AllocationStatusBadge } from "./AllocationStatusBadge";
import { unitsLine } from "./BngDashboardCards";
import { BngMonitoringCard } from "./BngMonitoringCard";
import { BngSignoffsCard } from "./BngSignoffsCard";
import {
  useBngLabels,
  useBngMyAccess,
  useCaseAllocations,
  useCaseFinancials,
  useCaseTransactions,
} from "@/queries/bng";
import { useRefreshCaseData } from "@/queries/workflow";
import { buttonClass } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type Props = {
  caseId: number;
  summary?: BngMetricSummary;
  // For the sign-off history: step titles and the recorded sign-offs.
  steps?: Record<string, WorkflowStep>;
  signoffs?: unknown;
};

const CANNOT_DECIDE: BngCapacity = { kind: "none", role: null, roles: [] };

const card = "rounded-2xl surface-card p-5";

/**
 * The BNG part of the project dashboard: the metric, the marketplace
 * requests / allocations, a habitat bank's finances and the transactions.
 */
export function BngCaseSummary({ caseId, summary, steps, signoffs }: Props) {
  const isBank = summary?.role === "habitat_bank";
  const access = useBngMyAccess(caseId);
  const labels = useBngLabels();
  // Whether the user decides on requests (the bank) or releases them (the
  // development): from the API, the same rule that checks the action.
  const capacity = access?.capacities?.allocations ?? CANNOT_DECIDE;
  const [onBehalf, setOnBehalf] = useState(false);
  const canDecide = capacity.kind === "own" || (capacity.kind === "on_behalf" && onBehalf);
  const refreshCaseData = useRefreshCaseData();
  // Null while loading; a list that fails to load shows as empty.
  const allocationsQuery = useCaseAllocations(caseId);
  const allocations = allocationsQuery.data ?? (allocationsQuery.isError ? [] : null);
  const transactionsQuery = useCaseTransactions(caseId);
  const transactions = transactionsQuery.data ?? (transactionsQuery.isError ? [] : null);
  const financials = useCaseFinancials(caseId, isBank).data ?? null;
  // From the project's data, which reloads after each action.
  const metric = summary;
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function act(allocation: BngAllocation, action: "accept" | "decline" | "release") {
    if (allocation.id == null) return;
    setError("");
    setBusyId(allocation.id);
    try {
      await bngService.allocationAction(allocation.id, action, capacity.kind === "on_behalf");
      // Also reloads the metric and the dashboard's allocations card, and
      // the habitat bank's side of the request.
      await refreshCaseData(caseId);
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
          className="inline-flex items-center gap-2 text-sm font-semibold !text-accent-200 hover:!text-accent-100"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Open project report
        </Link>
      </div>

      <BngMetricPanel summary={metric} />

      {isBank && financials && <FinancialsCard financials={financials} />}

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-fg">
            {isBank ? "Reservation requests and allocations" : "Off-site units"}
          </h3>
          <Link href="/bng/marketplace" className="text-sm font-semibold !text-accent-200 hover:!text-accent-100">
            Marketplace →
          </Link>
        </div>

        {error && (
          <Alert tone="danger" as="p" className="mt-3">{error}</Alert>
        )}

        {capacity.kind === "on_behalf" && open.some((a) => (isBank ? a.status === "requested" : a.status === "requested" || a.status === "reserved")) && (
          <Alert tone="warning" as="label" className="mt-3 flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={onBehalf} onChange={(e) => setOnBehalf(e.target.checked)} className="mt-0.5 h-4 w-4 accent-warning-400" />
            <span>
              These decisions are for the {labels.roleNames(capacity.roles)}. I am recording them on their behalf.
            </span>
          </Alert>
        )}

        {allocations === null ? (
          <p className="mt-3 text-sm text-fg/60">Loading…</p>
        ) : open.length === 0 ? (
          <p className="mt-3 text-sm text-fg/60">
            {isBank ? "No developments have requested units from this habitat bank yet." : "No off-site units requested."}
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-fg/10">
            {open.map((allocation) => {
              const otherName = isBank ? allocation.development_name : allocation.habitat_bank_name;
              const busy = busyId === allocation.id;
              return (
                <li key={allocation.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-fg">
                        {otherName ?? (isBank ? "Development" : "Habitat bank")}
                      </span>
                      {allocation.status && <AllocationStatusBadge status={allocation.status} />}
                    </div>
                    <p className="text-fg/70 tabular-nums">
                      {unitsLine(allocation)}
                      {allocation.total_price != null && ` · ${formatMoney(allocation.total_price)}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {canDecide && isBank && allocation.status === "requested" && (
                      <>
                        <button type="button" disabled={busy} onClick={() => act(allocation, "accept")} className={`${buttonClass("primary", "sm")} disabled:opacity-60`}>
                          Accept
                        </button>
                        <button type="button" disabled={busy} onClick={() => act(allocation, "decline")} className={`${buttonClass("ghost", "sm")} disabled:opacity-60`}>
                          Decline
                        </button>
                      </>
                    )}
                    {canDecide && !isBank && (allocation.status === "requested" || allocation.status === "reserved") && (
                      <button type="button" disabled={busy} onClick={() => act(allocation, "release")} className={`${buttonClass("ghost", "sm")} disabled:opacity-60`}>
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
          <p className="mt-3 text-xs text-fg/50">
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
      <h3 className="text-base font-semibold text-fg">Finances</h3>
      {!financials.prices_set && (
        <p className="mt-2 text-sm text-warning-200">Set your unit prices in the Unit Pricing step to see revenue.</p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map(([label, value, hint]) => (
          <div key={label} className="rounded-xl surface-card p-3">
            <p className="text-eyebrow tracking-wider">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-fg">{formatMoney(value)}</p>
            <p className="text-xs text-fg/50">{hint}</p>
          </div>
        ))}
      </div>
      <RevenueSplit financials={financials} />
    </section>
  );
}

function RevenueSplit({ financials }: { financials: BngFinancials }) {
  const labels = useBngLabels();
  const shares = financials.revenue_shares;
  const distribution = financials.revenue_distribution;
  if (!shares && !distribution?.retired_revenue) {
    return (
      <p className="mt-4 text-sm text-fg/55">
        Set the revenue split (landowner, investor, habitat manager) in the Unit Pricing step.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <p className="mb-2 text-eyebrow tracking-wider">Revenue split</p>
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-fg/50">
          <tr>
            <th className="py-1.5 pr-3 font-semibold">Party</th>
            <th className="py-1.5 pr-3 text-right font-semibold">Current share</th>
            <th className="py-1.5 text-right font-semibold">Earned from retired units</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-fg/10 text-fg/85">
          {labels.revenueParties.map(({ code, label }) => (
            <tr key={code}>
              <td className="py-2 pr-3">{label}</td>
              <td className="py-2 pr-3 text-right tabular-nums">
                {shares ? `${shares[code as BngRevenueParty]}%` : "—"}
              </td>
              <td className="py-2 text-right tabular-nums">
                {formatMoney(distribution?.distributed[code as BngRevenueParty] ?? null)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {(distribution?.not_split ?? 0) > 0 && (
        <p className="mt-2 text-xs text-fg/50">
          {formatMoney(distribution?.not_split ?? null)} was sold before a split was set and isn&apos;t divided.
        </p>
      )}
    </div>
  );
}

function TransactionsCard({ transactions, isBank }: { transactions: BngTransaction[] | null; isBank: boolean }) {
  return (
    <section className={card}>
      <h3 className="text-base font-semibold text-fg">Transactions</h3>
      {!transactions || transactions.length === 0 ? (
        <p className="mt-3 text-sm text-fg/60">
          None yet. A transaction is recorded when the development&apos;s gain plan is approved.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-fg/10 text-sm">
          {transactions.map((transaction) => {
            const otherName = isBank ? transaction.development_name : transaction.habitat_bank_name;
            return (
              <li key={transaction.reference} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <div>
                  <p className="font-mono text-fg">{transaction.reference}</p>
                  <p className="text-fg/60">
                    {otherName ?? (isBank ? "Development" : "Habitat bank")}
                    {transaction.created_at && ` · ${formatDay(transaction.created_at)}`}
                  </p>
                </div>
                <p className="text-fg/75 tabular-nums">
                  {unitsLine(transaction)} · <span className="font-semibold text-fg">{formatMoney(transaction.total_price)}</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
