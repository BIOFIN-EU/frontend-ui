"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBngLabels, useMarketplace } from "@/queries/bng";
import {
  BNG_CATEGORIES,
  formatMoney,
  formatUnits,
  type BngCategory,
  type BngHabitatBank,
  type BngMarketplaceDevelopment,
  type BngMatch,
} from "@/types/bng";
import { buttonClass } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";

type SortKey = "match" | "available" | "price";

const inputClass = fieldClass("compact", { inline: true });

function readParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

// Marketplace (diagram steps 9-10): registered habitat banks with units for
// sale; for a chosen development, how well each covers what it still needs.
// The matching, the need and whether units can be reserved come from the API.
export default function BngMarketplacePage() {
  const router = useRouter();
  const labels = useBngLabels();
  const [category, setCategory] = useState<BngCategory>("area");

  // ?development=<id> from the URL until the user picks one ("" = none);
  // the API ignores one that isn't the user's.
  const [picked, setPicked] = useState<string | null>(null);
  const developmentId = picked ?? readParam("development") ?? "";

  const query = useMarketplace(developmentId);
  const banks = query.data?.banks ?? null;
  const developments = query.data?.developments ?? [];
  const development = query.data?.development ?? null;
  // Switching development: the last one stays shown until the new one loads.
  const loadingDevelopment = query.isPlaceholderData;
  const error = query.error ? query.error.message || "Could not load the marketplace." : "";

  // Best match first when a development is chosen, until the user sorts.
  const [sortChoice, setSort] = useState<SortKey | null>(null);
  const sort: SortKey = sortChoice ?? (development ? "match" : "available");

  function chooseDevelopment(id: string) {
    setPicked(id);
    router.replace(id ? `/bng/marketplace?development=${id}` : "/bng/marketplace", { scroll: false });
    setSort(null);
  }

  const totalNeed = development ? BNG_CATEGORIES.reduce((sum, c) => sum + development.need[c], 0) : 0;

  const listed = useMemo(() => {
    const rows = (banks ?? []).map((bank) => ({ bank, fit: bank.match }));
    const visible = development
      ? rows.filter((row) => BNG_CATEGORIES.some((c) => (row.bank.available_units?.[c] ?? 0) > 0))
      : rows.filter((row) => (row.bank.available_units?.[category] ?? 0) > 0);
    // "Best match" keeps the API's ranking; the other sorts are only display.
    if (sort === "match") return visible;
    return [...visible].sort((a, b) => {
      if (sort === "price") return (a.bank.prices?.[category] ?? Infinity) - (b.bank.prices?.[category] ?? Infinity);
      return (b.bank.available_units[category] ?? 0) - (a.bank.available_units[category] ?? 0);
    });
  }, [banks, development, category, sort]);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="BNG Marketplace"
        subtitle="Registered habitat banks with biodiversity units still available. Choose one of your developments to see how much of its shortfall each bank covers, and reserve units from it."
      >
        <p className="text-xs text-fg/50">Prototype · Simplified metric, not the Statutory Biodiversity Metric</p>
      </PageHeader>

      <section className="rounded-2xl border border-accent-400/20 bg-accent-500/[0.06] p-4 sm:p-5">
        {developments.length === 0 ? (
          <p className="text-sm text-fg/70">
            To see matches and reserve units, create a{" "}
            <Link href="/pathways?tab=bng" className="font-semibold !text-accent-200 hover:!text-accent-100">
              BNG Development
            </Link>{" "}
            project.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex flex-wrap items-center gap-2 text-sm text-fg/80">
              Showing matches for
              <select
                value={development ? String(development.case_id) : ""}
                onChange={(e) => chooseDevelopment(e.target.value)}
                className={inputClass}
              >
                <option value="">No development (browse only)</option>
                {developments.map((item) => (
                  <option key={item.case_id} value={item.case_id}>
                    {item.name || `Development #${item.case_id}`}
                  </option>
                ))}
              </select>
            </label>
            {loadingDevelopment && <span className="text-sm text-fg/55">Loading…</span>}
          </div>
        )}

        {development && !loadingDevelopment && (
          <p className="mt-3 text-sm text-fg/75">
            {development.reservation_status === "not_needed"
              ? "This development meets its 10% target on-site, so it doesn't need off-site units."
              : totalNeed <= 0
                ? "This development's target is already covered by its requests and reservations."
                : `Still needed off-site: ${BNG_CATEGORIES.filter((c) => development.need[c] > 0)
                    .map((c) => `${formatUnits(development.need[c])} ${labels.category(c).toLowerCase()}`)
                    .join(", ")} units.`}
            {development.reservation_status === "not_reached" &&
              " Units can be reserved once it reaches its Off-Site Unit Reservation step."}
          </p>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        {!development && (
          <label className="flex items-center gap-2 text-sm text-fg/70">
            Units
            <select value={category} onChange={(e) => setCategory(e.target.value as BngCategory)} className={inputClass}>
              {BNG_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {labels.category(option)}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex items-center gap-2 text-sm text-fg/70">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={inputClass}>
            {development && <option value="match">Best match</option>}
            <option value="available">Most available</option>
            <option value="price">Lowest price</option>
          </select>
        </label>
      </div>

      {error && (
        <Alert tone="danger" role="alert">
          {error}
        </Alert>
      )}

      {banks === null ? (
        !error && <p className="text-sm text-fg/60">Loading habitat banks…</p>
      ) : listed.length === 0 ? (
        <p className="text-sm text-fg/60">
          {development
            ? "No registered habitat banks have units available yet."
            : `No registered habitat banks have ${labels.category(category).toLowerCase()} units available yet.`}
        </p>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {listed.map(({ bank, fit }) => (
            <article key={bank.case_id} className="flex flex-col rounded-2xl border border-fg/10 bg-fg/[0.035] p-4 sm:p-5">
              <div>
                <h2 className="text-lg font-semibold text-fg">{bank.name ?? "Habitat bank"}</h2>
                <p className="text-sm text-fg/60">
                  {[bank.site_names?.join(", "), bank.countries?.join(", ")].filter(Boolean).join(" · ") ||
                    "Site details not given"}
                  {bank.site_area_ha ? ` · ${formatUnits(bank.site_area_ha)} ha` : ""}
                </p>
              </div>

              <table className="mt-4 w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-fg/50">
                  <tr>
                    <th className="py-1.5 pr-3 font-semibold">Category</th>
                    <th className="py-1.5 pr-3 text-right font-semibold">Available</th>
                    <th className="py-1.5 pr-3 text-right font-semibold">Total uplift</th>
                    <th className="py-1.5 text-right font-semibold">Price / unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fg/10 text-fg/85">
                  {BNG_CATEGORIES.filter((c) => (bank.uplift_units?.[c] ?? bank.available_units[c] ?? 0) > 0).map((c) => (
                    <tr key={c} className={!development && c === category ? "text-fg" : undefined}>
                      <td className="py-2 pr-3">{labels.category(c)}</td>
                      <td className="py-2 pr-3 text-right font-semibold tabular-nums text-accent-200">
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
  development: BngMarketplaceDevelopment;
  fit: BngMatch;
  totalNeed: number;
}) {
  const alreadyRequested = development.requested_bank_ids.includes(bank.case_id);
  const href = `/pathways/${development.case_id}?step=${development.reservation_step}&bank=${bank.case_id}`;

  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-fg/10 pt-4 text-sm">
      <p className="text-fg/75">
        {totalNeed <= 0 ? (
          "Nothing more needed for this development."
        ) : fit.coverage > 0 ? (
          <>
            Covers <span className="font-semibold text-fg">{Math.round(fit.coverage * 100)}%</span> of what{" "}
            {development.name || `Development #${development.case_id}`} still needs
            {fit.cost != null && (
              <>
                {" "}· about <span className="font-semibold text-fg">{formatMoney(fit.cost)}</span>
              </>
            )}
          </>
        ) : (
          "Has none of the unit types this development needs."
        )}
        {alreadyRequested && <span className="block text-xs text-fg/50">Already requested by this development.</span>}
      </p>

      {development.reservation_status === "open" && (fit.coverage > 0 || alreadyRequested) ? (
        <Link href={href} className={buttonClass("primary", "sm")}>
          {alreadyRequested ? "Change reservation →" : "Reserve units →"}
        </Link>
      ) : development.reservation_status === "not_reached" && fit.coverage > 0 ? (
        <span className="text-xs text-fg/50">Reserve once the development reaches Off-Site Unit Reservation</span>
      ) : development.reservation_status === "completed" ? (
        <span className="text-xs text-fg/50">This development is complete</span>
      ) : null}
    </div>
  );
}
