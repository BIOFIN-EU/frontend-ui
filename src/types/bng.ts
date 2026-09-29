// Biodiversity Net Gain prototype (physical-api /api/bng and bng_* workflows).

export type BngCategory = "area" | "hedgerow" | "watercourse";

export const BNG_CATEGORIES: BngCategory[] = ["area", "hedgerow", "watercourse"];

export const BNG_CATEGORY_LABEL: Record<BngCategory, string> = {
  area: "Area habitats",
  hedgerow: "Hedgerows",
  watercourse: "Watercourses",
};

// Area habitats are measured in hectares, hedgerows and watercourses in km.
export const BNG_SIZE_UNIT: Record<BngCategory, string> = {
  area: "ha",
  hedgerow: "km",
  watercourse: "km",
};

export const BNG_UNIT_NAME: Record<BngCategory, string> = {
  area: "habitat units",
  hedgerow: "hedgerow units",
  watercourse: "watercourse units",
};

export type BngHabitatType = {
  id: number;
  name: string;
  category: BngCategory;
  distinctiveness: string;
  description?: string | null;
};

export type BngMultiplierOption = {
  id: number;
  name: string;
  multiplier: number;
  description?: string | null;
};

export type BngReferenceData = {
  habitat_types: BngHabitatType[];
  conditions: BngMultiplierOption[];
  strategic_significance: BngMultiplierOption[];
};

export type BngHabitatParcel = {
  id?: number;
  phase?: "baseline" | "proposed";
  category?: BngCategory;
  parcel_name: string | null;
  habitat_type_id: number;
  habitat_type_name?: string;
  distinctiveness?: string;
  condition_id: number;
  condition_name?: string;
  strategic_significance_id: number;
  strategic_significance_name?: string;
  size: number;
  units?: number;
};

export type BngCategoryMetric = {
  category: BngCategory;
  baseline_units: number;
  proposed_units: number;
  change_units: number;
  change_percent: number | null;
  allocated_units: number;
  // habitat banks
  available_units?: number;
  // developments
  target_units?: number;
  onsite_shortfall_units?: number;
  remaining_shortfall_units?: number;
  meets_target?: boolean;
};

export type BngMetricSummary = {
  role: "habitat_bank" | "development";
  net_gain_target_percent: number;
  categories: BngCategoryMetric[];
  meets_target?: boolean;
  onsite_meets_target?: boolean;
};

export type BngHabitatBank = {
  case_id: number;
  name: string | null;
  available_units: Record<BngCategory, number>;
};

export type BngAllocation = {
  habitat_bank_case_id: number;
  habitat_bank_name?: string | null;
  habitat_units: number;
  hedgerow_units: number;
  watercourse_units: number;
};

export type BngAllocationStepData = {
  _saved: boolean;
  allocations: BngAllocation[];
};

export type BngDevelopmentAllocation = {
  development_case_id: number;
  development_name: string | null;
  habitat_units: number;
  hedgerow_units: number;
  watercourse_units: number;
};

export const BNG_ALLOCATION_UNIT_FIELD: Record<BngCategory, keyof Pick<BngAllocation, "habitat_units" | "hedgerow_units" | "watercourse_units">> = {
  area: "habitat_units",
  hedgerow: "hedgerow_units",
  watercourse: "watercourse_units",
};

export function formatUnits(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
