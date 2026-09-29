"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth.context";
import { bngService } from "@/services/bng.service";
import {
  BNG_CATEGORIES,
  BNG_CATEGORY_LABEL,
  formatMoney,
  formatUnits,
  type BngCategory,
  type BngHabitatBank,
} from "@/types/bng";

type SortKey = "available" | "price";

const inputClass =
  "rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400";

// Marketplace (diagram step 9): registered habitat banks with units for sale.
export default function BngMarketplacePage() {
  const { user } = useAuth();
  const [banks, setBanks] = useState<BngHabitatBank[] | null>(null);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<BngCategory>("area");
  const [sort, setSort] = useState<SortKey>("available");

  useEffect(() => {
    if (!user) return;
    bngService
      .listHabitatBanks()
      .then(setBanks)
      .catch((err) => setError(err?.message || "Could not load the marketplace."));
  }, [user]);

  const sorted = useMemo(() => {
    const list = (banks ?? []).filter((bank) => (bank.available_units?.[category] ?? 0) > 0);
    return list.sort((a, b) =>
      sort === "price"
        ? (a.prices?.[category] ?? Infinity) - (b.prices?.[category] ?? Infinity)
        : (b.available_units[category] ?? 0) - (a.available_units[category] ?? 0)
    );
  }, [banks, category, sort]);

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">BNG Marketplace</h1>
        <p className="max-w-3xl text-sm text-white/70">
          Registered habitat banks with biodiversity units still available. To reserve units, open your BNG
          Development project and go to the Off-Site Unit Reservation step.
        </p>
        <p className="text-xs text-white/50">Prototype · Simplified metric, not the Statutory Biodiversity Metric</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
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
        <label className="flex items-center gap-2 text-sm text-white/70">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={inputClass}>
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
      ) : sorted.length === 0 ? (
        <p className="text-sm text-white/60">
          No registered habitat banks have {BNG_CATEGORY_LABEL[category].toLowerCase()} units available yet.
        </p>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {sorted.map((bank) => (
            <article key={bank.case_id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {bank.name ?? "Habitat bank"}
                  </h2>
                  <p className="text-sm text-white/60">
                    {[bank.site_names?.join(", "), bank.countries?.join(", ")].filter(Boolean).join(" · ") || "Site details not given"}
                    {bank.site_area_ha ? ` · ${formatUnits(bank.site_area_ha)} ha` : ""}
                  </p>
                </div>
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
                    <tr key={c} className={c === category ? "text-white" : undefined}>
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
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
