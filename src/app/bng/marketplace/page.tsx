"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { bngService } from "@/services/bng.service";
import { caseListService } from "@/services/case-list.service";
import { caseDashboardService } from "@/services/case-dashboard.service";
import { workflowService } from "@/services/workflow.service";
import {
  BNG_ACTIVE_STATUSES,
  BNG_CATEGORIES,
  BNG_CATEGORY_LABEL,
  formatMoney,
  formatUnits,
  type BngAllocationStepData,
  type BngCategory,
  type BngHabitatBank,
  type BngMetricSummary,
} from "@/types/bng";
import type { CaseListItem } from "@/types/case-list";
import { buttonBaseSm, buttonPrimary } from "@/lib/ui";

type SortKey = "match" | "available" | "price";
type Units = Record<BngCategory, number>;

const ZERO: Units = { area: 0, hedgerow: 0, watercourse: 0 };
const ALLOCATION_STEP = "offsite_allocation";

const inputClass =
  "rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400";

// The development the marketplace is showing matches for.
type Development = {
  id: number;
  name: string;
  need: Units;
  // Whether units can be reserved from its Off-Site Unit Reservation step.
  reservable: "open" | "not_reached" | "not_needed" | "completed";
  requestedBankIds: Set<number>;
};

function readParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

async function loadDevelopment(item: CaseListItem): Promise<Development> {
  const [dashboard, state] = await Promise.all([
    caseDashboardService.getCaseDashboard(item.caseId),
    workflowService.getCaseState(item.caseId),
  ]);
  const metric = dashboard.bng_metric as BngMetricSummary | undefined;
  const need = { ...ZERO };
  for (const entry of metric?.categories ?? []) {
    // Still needed, less what is already requested and awaiting the bank.
    need[entry.category] = Math.max((entry.remaining_shortfall_units ?? 0) - (entry.pending_units ?? 0), 0);
  }

  const allocation = dashboard[ALLOCATION_STEP] as (BngAllocationStepData & { _skipped?: boolean }) | undefined;
  const reservable: Development["reservable"] =
    state.status === "completed"
      ? "completed"
      : allocation?._skipped
        ? "not_needed"
        : allocation || state.current_step === ALLOCATION_STEP
          ? "open"
          : "not_reached";

  return {
    id: item.caseId,
    name: item.name || `Development #${item.caseId}`,
    need,
    reservable,
    requestedBankIds: new Set(
      (allocation?.allocations ?? [])
        .filter((a) => a.status && BNG_ACTIVE_STATUSES.includes(a.status))
        .map((a) => a.habitat_bank_case_id)
    ),
  };
}

function match(bank: BngHabitatBank, need: Units) {
  const take = { ...ZERO };
  let total = 0;
  for (const category of BNG_CATEGORIES) {
    take[category] = Math.min(bank.available_units?.[category] ?? 0, need[category]);
    total += need[category];
  }
  const covered = BNG_CATEGORIES.reduce((sum, category) => sum + take[category], 0);
  let cost: number | null = 0;
  for (const category of BNG_CATEGORIES) {
    if (take[category] <= 0) continue;
    const price = bank.prices?.[category];
    cost = price == null || cost == null ? null : cost + take[category] * price;
  }
  return { take, coverage: total > 0 ? covered / total : 0, cost };
}

// Marketplace (diagram steps 9-10): registered habitat banks with units for
// sale; for a chosen development, how well each covers what it still needs.
export default function BngMarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [banks, setBanks] = useState<BngHabitatBank[] | null>(null);
  const [developments, setDevelopments] = useState<CaseListItem[]>([]);
  const [developmentId, setDevelopmentId] = useState<string>("");
  const [development, setDevelopment] = useState<Development | null>(null);
  const [loadingDevelopment, setLoadingDevelopment] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<BngCategory>("area");
  const [sort, setSort] = useState<SortKey>("available");

  useEffect(() => {
    if (!user) return;
    bngService
      .listHabitatBanks()
      .then(setBanks)
      .catch((err) => setError(err?.message || "Could not load the marketplace."));
    caseListService
      .getCases()
      .then((cases) => {
        const mine = cases.filter((item) => item.caseType === "bng_development_v1");
        setDevelopments(mine);
        const requested = readParam("development");
        if (requested && mine.some((item) => String(item.caseId) === requested)) setDevelopmentId(requested);
      })
      .catch(() => setDevelopments([]));
  }, [user]);

  useEffect(() => {
    const item = developments.find((candidate) => String(candidate.caseId) === developmentId);
    if (!item) {
      setDevelopment(null);
      return;
    }
    let current = true;
    setLoadingDevelopment(true);
    loadDevelopment(item)
      .then((value) => current && setDevelopment(value))
      .catch(() => current && setDevelopment(null))
      .finally(() => current && setLoadingDevelopment(false));
    setSort("match");
    return () => {
      current = false;
    };
  }, [developmentId, developments]);

  function chooseDevelopment(id: string) {
    setDevelopmentId(id);
    router.replace(id ? `/bng/marketplace?development=${id}` : "/bng/marketplace", { scroll: false });
    if (!id && sort === "match") setSort("available");
  }

  const totalNeed = development ? BNG_CATEGORIES.reduce((sum, c) => sum + development.need[c], 0) : 0;

  const listed = useMemo(() => {
    const rows = (banks ?? []).map((bank) => ({ bank, fit: development ? match(bank, development.need) : null }));
    const visible = development
      ? rows.filter((row) => BNG_CATEGORIES.some((c) => (row.bank.available_units?.[c] ?? 0) > 0))
      : rows.filter((row) => (row.bank.available_units?.[category] ?? 0) > 0);
    return visible.sort((a, b) => {
      if (sort === "match" && a.fit && b.fit) {
        return b.fit.coverage - a.fit.coverage || (a.fit.cost ?? Infinity) - (b.fit.cost ?? Infinity);
      }
      if (sort === "price") return (a.bank.prices?.[category] ?? Infinity) - (b.bank.prices?.[category] ?? Infinity);
      return (b.bank.available_units[category] ?? 0) - (a.bank.available_units[category] ?? 0);
    });
  }, [banks, development, category, sort]);

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">BNG Marketplace</h1>
        <p className="max-w-3xl text-sm text-white/70">
          Registered habitat banks with biodiversity units still available. Choose one of your developments to see
          how much of its shortfall each bank covers, and reserve units from it.
        </p>
        <p className="text-xs text-white/50">Prototype · Simplified metric, not the Statutory Biodiversity Metric</p>
      </header>

      <section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-5">
        {developments.length === 0 ? (
          <p className="text-sm text-white/70">
            To see matches and reserve units, create a{" "}
            <Link href="/pathways?tab=bng" className="font-semibold !text-emerald-200 hover:!text-emerald-100">
              BNG Development
            </Link>{" "}
            project.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex flex-wrap items-center gap-2 text-sm text-white/80">
              Showing matches for
              <select value={developmentId} onChange={(e) => chooseDevelopment(e.target.value)} className={inputClass}>
                <option value="">No development (browse only)</option>
                {developments.map((item) => (
                  <option key={item.caseId} value={item.caseId}>
                    {item.name || `Development #${item.caseId}`}
                  </option>
                ))}
              </select>
            </label>
            {loadingDevelopment && <span className="text-sm text-white/55">Loading…</span>}
          </div>
        )}

        {development && !loadingDevelopment && (
          <p className="mt-3 text-sm text-white/75">
            {development.reservable === "not_needed"
              ? "This development meets its 10% target on-site, so it doesn't need off-site units."
              : totalNeed <= 0
                ? "This development's target is already covered by its requests and reservations."
                : `Still needed off-site: ${BNG_CATEGORIES.filter((c) => development.need[c] > 0)
                    .map((c) => `${formatUnits(development.need[c])} ${BNG_CATEGORY_LABEL[c].toLowerCase()}`)
                    .join(", ")} units.`}
            {development.reservable === "not_reached" &&
              " Units can be reserved once it reaches its Off-Site Unit Reservation step."}
          </p>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        {!development && (
          <label className="flex items-center gap-2 text-sm text-white/70">
            Units
            <select value={category} onChange={(e) => setCategory(e.target.value as BngCategory)} className={inputClass}>
              {BNG_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {BNG_CATEGORY_LABEL[option]}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex items-center gap-2 text-sm text-white/70">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={inputClass}>
            {development && <option value="match">Best match</option>}
            <option value="available">Most available</option>
            <option value="price">Lowest price</option>
          </select>
        </label>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {!user || banks === null ? (
        !error && <p className="text-sm text-white/60">Loading habitat banks…</p>
      ) : listed.length === 0 ? (
        <p className="text-sm text-white/60">
          {development
            ? "No registered habitat banks have units available yet."
            : `No registered habitat banks have ${BNG_CATEGORY_LABEL[category].toLowerCase()} units available yet.`}
        </p>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {listed.map(({ bank, fit }) => (
            <article key={bank.case_id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div>
                <h2 className="text-lg font-semibold text-white">{bank.name ?? "Habitat bank"}</h2>
                <p className="text-sm text-white/60">
                  {[bank.site_names?.join(", "), bank.countries?.join(", ")].filter(Boolean).join(" · ") ||
                    "Site details not given"}
                  {bank.site_area_ha ? ` · ${formatUnits(bank.site_area_ha)} ha` : ""}
                </p>
              </div>

              <table className="mt-4 w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-white/50">
                  <tr>
                    <th className="py-1.5 pr-3 font-semibold">Category</th>
                    <th className="py-1.5 pr-3 text-right font-semibold">Available</th>
                    <th className="py-1.5 pr-3 text-right font-semibold">Total uplift</th>
                    <th className="py-1.5 text-right font-semibold">Price / unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-white/85">
                  {BNG_CATEGORIES.filter((c) => (bank.uplift_units?.[c] ?? bank.available_units[c] ?? 0) > 0).map((c) => (
                    <tr key={c} className={!development && c === category ? "text-white" : undefined}>
                      <td className="py-2 pr-3">{BNG_CATEGORY_LABEL[c]}</td>
                      <td className="py-2 pr-3 text-right font-semibold tabular-nums text-emerald-200">
                        {formatUnits(bank.available_units[c])}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">{formatUnits(bank.uplift_units?.[c])}</td>
                      <td className="py-2 text-right tabular-nums">{formatMoney(bank.prices?.[c])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {development && fit && (
                <MatchFooter bank={bank} development={development} fit={fit} totalNeed={totalNeed} />
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function MatchFooter({
  bank,
  development,
  fit,
  totalNeed,
}: {
  bank: BngHabitatBank;
  development: Development;
  fit: ReturnType<typeof match>;
  totalNeed: number;
}) {
  const alreadyRequested = development.requestedBankIds.has(bank.case_id);
  const href = `/pathways/${development.id}?step=${ALLOCATION_STEP}&bank=${bank.case_id}`;

  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm">
      <p className="text-white/75">
        {totalNeed <= 0 ? (
          "Nothing more needed for this development."
        ) : fit.coverage > 0 ? (
          <>
            Covers <span className="font-semibold text-white">{Math.round(fit.coverage * 100)}%</span> of what{" "}
            {development.name} still needs
            {fit.cost != null && (
              <>
                {" "}· about <span className="font-semibold text-white">{formatMoney(fit.cost)}</span>
              </>
            )}
          </>
        ) : (
          "Has none of the unit types this development needs."
        )}
        {alreadyRequested && <span className="block text-xs text-white/50">Already requested by this development.</span>}
      </p>

      {development.reservable === "open" && (fit.coverage > 0 || alreadyRequested) ? (
        <Link href={href} className={`${buttonBaseSm} ${buttonPrimary}`}>
          {alreadyRequested ? "Change reservation →" : "Reserve units →"}
        </Link>
      ) : development.reservable === "not_reached" && fit.coverage > 0 ? (
        <span className="text-xs text-white/50">Reserve once the development reaches Off-Site Unit Reservation</span>
      ) : development.reservable === "completed" ? (
        <span className="text-xs text-white/50">This development is complete</span>
      ) : null}
    </div>
  );
}
