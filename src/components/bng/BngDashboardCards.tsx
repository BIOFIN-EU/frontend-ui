"use client";

import Link from "next/link";
import {
  BNG_CATEGORIES,
  BNG_CATEGORY_LABEL,
  BNG_SIZE_UNIT,
  formatUnits,
  type BngAllocationStepData,
  type BngDevelopmentAllocation,
  type BngHabitatParcel,
} from "@/types/bng";

/** Read-only habitat parcels of one phase (project dashboard). */
export function HabitatParcelsCard({ parcels }: { parcels: unknown }) {
  const rows = Array.isArray(parcels) ? (parcels as BngHabitatParcel[]) : [];

  if (rows.length === 0) {
    return <p className="text-sm text-white/60">No habitats recorded.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-white/50">
          <tr>
            <th className="px-4 py-3 font-semibold">Parcel</th>
            <th className="px-4 py-3 font-semibold">Habitat</th>
            <th className="px-4 py-3 text-right font-semibold">Size</th>
            <th className="px-4 py-3 font-semibold">Condition</th>
            <th className="px-4 py-3 font-semibold">Significance</th>
            <th className="px-4 py-3 text-right font-semibold">Units</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-white/85">
          {rows.map((parcel, index) => {
            const category = parcel.category ?? "area";
            return (
              <tr key={parcel.id ?? index}>
                <td className="px-4 py-3">{parcel.parcel_name || `Parcel ${index + 1}`}</td>
                <td className="px-4 py-3">
                  <p className="text-white">{parcel.habitat_type_name}</p>
                  <p className="text-xs text-white/50">{BNG_CATEGORY_LABEL[category]}</p>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {parcel.size} {BNG_SIZE_UNIT[category]}
                </td>
                <td className="px-4 py-3">{parcel.condition_name}</td>
                <td className="px-4 py-3">{parcel.strategic_significance_name}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatUnits(parcel.units)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** A development's off-site units, per habitat bank. */
export function AllocationsCard({ data }: { data: unknown }) {
  const allocations = (data as BngAllocationStepData | null)?.allocations ?? [];

  if (allocations.length === 0) {
    return <p className="text-sm text-white/60">No off-site units allocated.</p>;
  }

  return (
    <div className="space-y-3">
      {allocations.map((allocation) => (
        <div key={allocation.habitat_bank_case_id} className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-semibold text-white">
            #{allocation.habitat_bank_case_id} {allocation.habitat_bank_name ?? "Habitat bank"}
          </p>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
            {BNG_CATEGORIES.map((category) => {
              const value =
                category === "area"
                  ? allocation.habitat_units
                  : category === "hedgerow"
                    ? allocation.hedgerow_units
                    : allocation.watercourse_units;
              return (
                <p key={category} className="text-white/75">
                  {BNG_CATEGORY_LABEL[category]}:{" "}
                  <span className="font-semibold tabular-nums text-white">{formatUnits(value)}</span>
                </p>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Which developments have taken units from this habitat bank. */
export function BankAllocationsCard({ allocations }: { allocations: unknown }) {
  const rows = Array.isArray(allocations) ? (allocations as BngDevelopmentAllocation[]) : [];

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <h3 className="text-base font-semibold text-white">Units allocated to developments</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-white/60">No developments have taken units from this habitat bank yet.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {rows.map((row) => (
            <li key={row.development_case_id} className="flex flex-wrap items-baseline justify-between gap-2">
              <Link href={`/projects/${row.development_case_id}`} className="font-semibold !text-emerald-200 hover:!text-emerald-100">
                #{row.development_case_id} {row.development_name ?? "Development"}
              </Link>
              <span className="text-white/70 tabular-nums">
                {formatUnits(row.habitat_units)} habitat · {formatUnits(row.hedgerow_units)} hedgerow ·{" "}
                {formatUnits(row.watercourse_units)} watercourse
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
