// Biodiversity Net Gain prototype (physical-api /api/bng and bng_* workflows).

export type BngCategory = "area" | "hedgerow" | "watercourse";

export const BNG_CATEGORIES: BngCategory[] = ["area", "hedgerow", "watercourse"];

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
  vocabulary: BngVocabulary;
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
  // habitat bank: all units developments hold; development: units secured
  // (accepted by the bank)
  allocated_units: number;
  // requested, awaiting the habitat bank's decision
  pending_units?: number;
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
  uplift_units?: Record<BngCategory, number>;
  prices?: Record<BngCategory, number | null>;
  countries?: string[];
  site_names?: string[];
  site_area_ha?: number;
};

// requested -> reserved (bank accepts) -> allocated (planning permission)
// -> retired (gain plan approved); declined / released free the units.
export type BngAllocationStatus =
  | "requested"
  | "reserved"
  | "allocated"
  | "retired"
  | "declined"
  | "released";

export type BngAllocation = {
  id?: number;
  status?: BngAllocationStatus;
  // Allocated or retired: can no longer be changed or released.
  locked?: boolean;
  development_case_id?: number;
  development_name?: string | null;
  habitat_bank_case_id: number;
  habitat_bank_name?: string | null;
  habitat_units: number;
  hedgerow_units: number;
  watercourse_units: number;
  price_per_habitat_unit?: number | null;
  price_per_hedgerow_unit?: number | null;
  price_per_watercourse_unit?: number | null;
  total_price?: number | null;
  requested_at?: string | null;
  decided_at?: string | null;
  allocated_at?: string | null;
  retired_at?: string | null;
  released_at?: string | null;
};

export type BngTransaction = {
  reference: string;
  development_case_id: number;
  development_name: string | null;
  habitat_bank_case_id: number;
  habitat_bank_name: string | null;
  habitat_units: number;
  hedgerow_units: number;
  watercourse_units: number;
  total_price: number | null;
  shares?: Record<BngRevenueParty, number> | null;
  split?: Record<BngRevenueParty, number | null> | null;
  created_at: string | null;
};

export type BngRevenueParty = "landowner" | "investor" | "manager";

export type BngFinancials = {
  prices: Record<BngCategory, number | null>;
  prices_set: boolean;
  delivery_cost: number | null;
  potential_revenue: number | null;
  committed_revenue: number | null;
  pipeline_revenue: number | null;
  potential_margin: number | null;
  // Phase 3: the bank's current split, and what each party earned from
  // retired units (at the split recorded with each sale).
  revenue_shares?: Record<BngRevenueParty, number> | null;
  revenue_distribution?: {
    retired_revenue: number | null;
    distributed: Record<BngRevenueParty, number | null>;
    not_split: number | null;
  };
};

export type BngAllocationStepData = {
  _saved: boolean;
  allocations: BngAllocation[];
};

export const BNG_ALLOCATION_UNIT_FIELD: Record<BngCategory, keyof Pick<BngAllocation, "habitat_units" | "hedgerow_units" | "watercourse_units">> = {
  area: "habitat_units",
  hedgerow: "hedgerow_units",
  watercourse: "watercourse_units",
};

export function formatMoney(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
}

export function formatUnits(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ---------- Phase 3: roles, sign-offs, monitoring ----------

export type BngRole = "landowner" | "investor" | "developer" | "ecologist" | "lpa";

// How the user may act for something owned by `roles` (from the API):
// as their own role, on behalf of it (a project manager, who confirms each
// time), or not at all.
export type BngCapacity = {
  kind: "own" | "on_behalf" | "none";
  role: BngRole | null;
  roles: BngRole[];
};

export type BngMyAccess = {
  roles: BngRole[];
  can_update: boolean;
  can_record_on_behalf: boolean;
  // Steps: the project's my-access (types/project-access).
  capacities?: {
    allocations: BngCapacity;
    monitoring_submit: BngCapacity | null;
    monitoring_verify: BngCapacity | null;
  };
};

export type BngSignoff = {
  id: number;
  step_code: string;
  user_id: string;
  role: BngRole | null;
  role_label: string | null;
  on_behalf: boolean;
  decision: "submitted" | "approved" | "rejected" | "edited";
  comment: string | null;
  created_at: string | null;
};



export type BngMonitoringStatus = "due" | "submitted" | "passed" | "failed" | "remediated";

export type BngRemedialAction = {
  id: number;
  description: string;
  due_date: string | null;
  status: "open" | "completed";
  completion_notes: string | null;
  completed_at: string | null;
};

export type BngMonitoringReport = {
  id: number;
  year: number;
  due_date: string;
  status: BngMonitoringStatus;
  overdue: boolean;
  habitats_on_track: boolean | null;
  condition_summary: string | null;
  management_carried_out: string | null;
  submitted_at: string | null;
  submitted_on_behalf: boolean;
  verification_notes: string | null;
  verified_at: string | null;
  verified_as: BngRole | null;
  verified_as_label: string | null;
  verified_on_behalf: boolean;
  remedial_actions: BngRemedialAction[];
};

export type BngMonitoringSummary = {
  scheduled: boolean;
  counts: Record<BngMonitoringStatus | "overdue", number>;
  next_due: { year: number; due_date: string } | null;
  open_remedial_actions: number;
};

export type BngMonitoring = {
  summary: BngMonitoringSummary;
  reports: BngMonitoringReport[];
};

export type BngReport = {
  case_id: number;
  case_type: string;
  role: "habitat_bank" | "development";
  name: string | null;
  metric: BngMetricSummary;
  allocations: BngAllocation[];
  transactions: BngTransaction[];
  signoffs: BngSignoff[];
  roles: Record<string, BngRole[]>;
  step_titles: Record<string, string>;
  financials?: BngFinancials;
  monitoring?: BngMonitoring;
};

// A date without the time, as dd/mm/yyyy ("2027-01-15" is read as a local day).
export function formatDay(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

// How BNG codes are shown (reference data's "vocabulary").
export type BngVocabulary = {
  roles: { code: BngRole; label: string }[];
  categories: { code: BngCategory; label: string; size_unit: string; unit_name: string }[];
  allocation_statuses: Record<BngAllocationStatus, string>;
  monitoring_statuses: Record<BngMonitoringStatus, string>;
  revenue_parties: Record<BngRevenueParty, string>;
  signoff_decisions: Record<BngSignoff["decision"], string>;
};

// How well a habitat bank covers a need, at its prices (cost null when a
// needed price isn't set).
export type BngMatch = { take: Record<BngCategory, number>; coverage: number; cost: number | null };

export type BngMarketplaceDevelopment = {
  case_id: number;
  name: string | null;
  // Still needed off-site, less what is already requested.
  need: Record<BngCategory, number>;
  reservation_status: "open" | "not_reached" | "not_needed" | "completed";
  // The step that reserves units (opened with ?bank=<id>).
  reservation_step: string;
  requested_bank_ids: number[];
};

export type BngMarketplace = {
  banks: (BngHabitatBank & { match: BngMatch | null })[];
  developments: { case_id: number; name: string | null }[];
  development: BngMarketplaceDevelopment | null;
};

// The reservation step's banks, with the most this development can take.
export type BngAllocationOption = {
  case_id: number;
  name: string | null;
  countries: string[];
  site_names: string[];
  max: Record<BngCategory, number>;
  prices: Record<BngCategory, number | null>;
};

export type BngAllocationOptions = { needed: Record<BngCategory, number>; banks: BngAllocationOption[] };

export type BngSuggestion = BngMatch & { bank_id: number };
