"use client";

import {
  BNG_ALLOCATION_UNIT_FIELD,
  BNG_CATEGORIES,
  formatUnits,
  type BngAllocation,
  type BngAllocationStepData,
  type BngHabitatParcel,
} from "@/types/bng";
import { useBngLabels } from "@/queries/bng";

/**
 * Read-only habitat parcels of one phase. The Overview shows them as entered;
 * the BNG tab adds their calculated units (`showUnits`).
 */
export function HabitatParcelsCard({ parcels, showUnits = false }: { parcels: unknown; showUnits?: boolean }) {
  const labels = useBngLabels();
  const rows = Array.isArray(parcels) ? (parcels as BngHabitatParcel[]) : [];

  if (rows.length === 0) {
    return <p className="text-sm text-fg/60">No habitats recorded.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl surface-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-fg/50">
          <tr>
            <th className="px-4 py-3 font-semibold">Parcel</th>
            <th className="px-4 py-3 font-semibold">Habitat</th>
            <th className="px-4 py-3 text-right font-semibold">Size</th>
            <th className="px-4 py-3 font-semibold">Condition</th>
            <th className="px-4 py-3 font-semibold">Significance</th>
            {showUnits && <th className="px-4 py-3 text-right font-semibold">Units</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-fg/10 text-fg/85">
          {rows.map((parcel, index) => {
            const category = parcel.category ?? "area";
            return (
              <tr key={parcel.id ?? index}>
                <td className="px-4 py-3">{parcel.parcel_name || `Parcel ${index + 1}`}</td>
                <td className="px-4 py-3">
                  <p className="text-fg">{parcel.habitat_type_name}</p>
                  <p className="text-xs text-fg/50">{labels.category(category)}</p>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {parcel.size} {labels.sizeUnit(category)}
                </td>
                <td className="px-4 py-3">{parcel.condition_name}</td>
                <td className="px-4 py-3">{parcel.strategic_significance_name}</td>
                {showUnits && (
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatUnits(parcel.units)}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function unitsLine(allocation: Pick<BngAllocation, "habitat_units" | "hedgerow_units" | "watercourse_units">) {
  return `${formatUnits(allocation.habitat_units)} habitat · ${formatUnits(allocation.hedgerow_units)} hedgerow · ${formatUnits(allocation.watercourse_units)} watercourse`;
}

/**
 * The off-site units a development requested in its reservation step, per
 * habitat bank, as entered. Their status and price (what happened after)
 * are on the BNG tab.
 */
export function AllocationsCard({ data }: { data: unknown }) {
  const labels = useBngLabels();
  const step = data as (BngAllocationStepData & { _skipped?: boolean }) | null;
  const allocations = step?.allocations ?? [];

  if (step?._skipped) {
    return <p className="text-sm text-fg/60">Not needed: the 10% target is met on-site.</p>;
  }
  if (allocations.length === 0) {
    return <p className="text-sm text-fg/60">No off-site units requested.</p>;
  }

  return (
    <div className="space-y-3">
      {allocations.map((allocation) => (
        <div key={allocation.id ?? allocation.habitat_bank_case_id} className="rounded-xl surface-card p-4">
          <p className="text-sm font-semibold text-fg">
            {allocation.habitat_bank_name ?? "Habitat bank"}
          </p>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
            {BNG_CATEGORIES.map((category) => (
              <p key={category} className="text-fg/75">
                {labels.category(category)}:{" "}
                <span className="font-semibold tabular-nums text-fg">
                  {formatUnits(allocation[BNG_ALLOCATION_UNIT_FIELD[category]])}
                </span>
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


