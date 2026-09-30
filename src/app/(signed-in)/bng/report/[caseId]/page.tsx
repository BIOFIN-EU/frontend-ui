"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { Printer } from "lucide-react";
import { useBngLabels, useBngReport } from "@/queries/bng";
import { formatDay, formatMoney, type BngRevenueParty } from "@/types/bng";
import { BngMetricPanel } from "@/components/bng/BngMetricPanel";
import { BngSignoffsCard } from "@/components/bng/BngSignoffsCard";
import { unitsLine } from "@/components/bng/BngDashboardCards";
import { buttonClass } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="break-inside-avoid rounded-2xl surface-card p-5">
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      <div className="mt-3 text-sm text-fg/80">{children}</div>
    </section>
  );
}

// Diagram step 32: one printable summary of a BNG project.
export default function BngReportPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { data: report, error } = useBngReport(caseId);
  const labels = useBngLabels();
  // Revenue parties in the API's order.
  const parties = labels.revenueParties.map((p) => p.code as BngRevenueParty);
  const partyLabel = (code: BngRevenueParty) => labels.revenueParties.find((p) => p.code === code)?.label ?? code;

  if (error) {
    return <Alert tone="danger">{error.message || "Could not load the report."}</Alert>;
  }
  if (!report) return <p className="text-sm text-fg/60">Loading report…</p>;

  const isBank = report.role === "habitat_bank";
  const roleRows = Object.entries(report.roles);

  return (
    <div className="space-y-5 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-200/70">
            {isBank ? "Habitat bank report" : "Development report"}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-fg">{report.name ?? "BNG project"}</h1>
          <p className="text-sm text-fg/55">
            Generated {formatDay(new Date().toISOString())} · Prototype, simplified metric (not the Statutory
            Biodiversity Metric)
          </p>
        </div>
        <div className="flex gap-3 print:hidden">
          <Link href={`/projects/${report.case_id}`} className={buttonClass("secondary")}>
            Back to project
          </Link>
          <button type="button" onClick={() => window.print()} className={`${buttonClass("secondary")} gap-2`}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print or save as PDF
          </button>
        </div>
      </header>

      <BngMetricPanel summary={report.metric} />

      <Section title="People and roles">
        {roleRows.length === 0 ? (
          <p className="text-fg/60">No roles given yet.</p>
        ) : (
          <ul className="space-y-1">
            {roleRows.map(([userId, roles]) => (
              <li key={userId}>
                <span className="break-all text-fg/60">{userId}</span>: {roles.map((r) => labels.role(r)).join(", ")}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={isBank ? "Reservations and allocations" : "Off-site units"}>
        {report.allocations.length === 0 ? (
          <p className="text-fg/60">None.</p>
        ) : (
          <ul className="divide-y divide-fg/10">
            {report.allocations.map((a) => (
              <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span>
                  <span className="font-semibold text-fg">{(isBank ? a.development_name : a.habitat_bank_name) ?? "—"}</span>
                  {" · "}
                  {a.status ? labels.allocationStatus(a.status) : ""}
                </span>
                <span className="tabular-nums text-fg/70">
                  {unitsLine(a)} · {formatMoney(a.total_price)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Transactions">
        {report.transactions.length === 0 ? (
          <p className="text-fg/60">None yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="text-xs uppercase tracking-wider text-fg/50">
                <tr>
                  <th className="py-1.5 pr-3 font-semibold">Reference</th>
                  <th className="py-1.5 pr-3 font-semibold">{isBank ? "Development" : "Habitat bank"}</th>
                  <th className="py-1.5 pr-3 font-semibold">Date</th>
                  <th className="py-1.5 pr-3 text-right font-semibold">Price</th>
                  {isBank && parties.map((p) => (
                    <th key={p} className="py-1.5 pr-3 text-right font-semibold">{partyLabel(p)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-fg/10">
                {report.transactions.map((t) => (
                  <tr key={t.reference}>
                    <td className="py-2 pr-3 font-mono text-fg">{t.reference}</td>
                    <td className="py-2 pr-3">{(isBank ? t.development_name : t.habitat_bank_name) ?? "—"}</td>
                    <td className="py-2 pr-3">{formatDay(t.created_at)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatMoney(t.total_price)}</td>
                    {isBank && parties.map((p) => (
                      <td key={p} className="py-2 pr-3 text-right tabular-nums">{formatMoney(t.split?.[p] ?? null)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {report.financials && (
        <Section title="Finances">
          <div className="grid gap-2 sm:grid-cols-2">
            <p>Potential revenue: <b className="text-fg">{formatMoney(report.financials.potential_revenue)}</b></p>
            <p>Committed revenue: <b className="text-fg">{formatMoney(report.financials.committed_revenue)}</b></p>
            <p>Pipeline: <b className="text-fg">{formatMoney(report.financials.pipeline_revenue)}</b></p>
            <p>Delivery cost: <b className="text-fg">{formatMoney(report.financials.delivery_cost)}</b></p>
            <p>Potential margin: <b className="text-fg">{formatMoney(report.financials.potential_margin)}</b></p>
            <p>
              Revenue split:{" "}
              <b className="text-fg">
                {report.financials.revenue_shares
                  ? parties.map((p) => `${partyLabel(p)} ${report.financials?.revenue_shares?.[p]}%`).join(", ")
                  : "not set"}
              </b>
            </p>
          </div>
        </Section>
      )}

      {report.monitoring && (
        <Section title="Monitoring">
          {!report.monitoring.summary.scheduled ? (
            <p className="text-fg/60">Starts once the habitat bank is registered.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="text-xs uppercase tracking-wider text-fg/50">
                <tr>
                  <th className="py-1.5 pr-3 font-semibold">Year</th>
                  <th className="py-1.5 pr-3 font-semibold">Due</th>
                  <th className="py-1.5 pr-3 font-semibold">Status</th>
                  <th className="py-1.5 font-semibold">Remedial actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fg/10">
                {report.monitoring.reports.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 pr-3">{r.year}</td>
                    <td className="py-2 pr-3">{formatDay(r.due_date)}{r.overdue ? " (overdue)" : ""}</td>
                    <td className="py-2 pr-3">{labels.monitoringStatus(r.status)}</td>
                    <td className="py-2">
                      {r.remedial_actions.length === 0
                        ? "—"
                        : r.remedial_actions.map((a) => `${a.description} (${a.status})`).join("; ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      )}

      <BngSignoffsCard titles={report.step_titles} signoffs={report.signoffs} />
    </div>
  );
}
