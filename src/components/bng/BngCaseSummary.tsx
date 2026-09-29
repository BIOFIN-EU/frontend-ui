"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { bngService } from "@/services/bng.service";
import {
  formatMoney,
  type BngAllocation,
  type BngFinancials,
  type BngMetricSummary,
  type BngTransaction,
} from "@/types/bng";
import { BngMetricPanel } from "./BngMetricPanel";
import { AllocationStatusBadge } from "./AllocationStatusBadge";
import { unitsLine } from "./BngDashboardCards";
import { buttonBaseSm, buttonGhost, buttonPrimary } from "@/lib/ui";

type Props = {
  caseId: number;
  summary?: BngMetricSummary;
};

const card = "rounded-2xl border border-white/10 bg-black/20 p-5";

/**
 * The BNG part of the project dashboard: the metric, the marketplace
 * requests / allocations, a habitat bank's finances and the transactions.
 */
export function BngCaseSummary({ caseId, summary }: Props) {
  const isBank = summary?.role === "habitat_bank";
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
      await bngService.allocationAction(allocation.id, action);
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
                    {isBank && allocation.status === "requested" && (
                      <>
                        <button type="button" disabled={busy} onClick={() => act(allocation, "accept")} className={`${buttonBaseSm} ${buttonPrimary} disabled:opacity-60`}>
                          Accept
                        </button>
                        <button type="button" disabled={busy} onClick={() => act(allocation, "decline")} className={`${buttonBaseSm} ${buttonGhost} disabled:opacity-60`}>
                          Decline
                        </button>
                      </>
                    )}
                    {!isBank && (allocation.status === "requested" || allocation.status === "reserved") && (
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
    </section>
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
                    {transaction.created_at && ` · ${new Date(transaction.created_at).toLocaleDateString("en-GB")}`}
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
