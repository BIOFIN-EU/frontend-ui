// Risk Score Framework responses (risk_framework/web_api/schemas), reached via
// the gateway's /api/vulnerability proxy, plus physical-api's /api/risk.

export type RasterSummaryStats = {
  mean_raster_value: number | null;
  std_raster_value: number | null;
};

export type RasterData = {
  raster: number[][];
  summary_stats: RasterSummaryStats;
  meta: Record<string, unknown>;
};

// Linguistic risk category -> lower bound, e.g. { low: 0.09, medium: 0.5, ... }.
export type RiskThresholds = Record<string, number>;

export type ExplanationPlaceholder = {
  text: string;
  data_type: string;
};

// A sentence with {{key}} placeholders that link to detail panels.
export type ExplanationBlock = {
  template: string;
  placeholders: Record<string, ExplanationPlaceholder>;
};

export type XaiSummary = {
  detailed_explanation: ExplanationBlock[];
  [key: string]: unknown;
};

// Display metadata for one class of a polygon layer (recommendations,
// resilience or risk), keyed by class id in the *_meta dictionaries.
export type CategoryMeta = {
  label: string;
  label_short?: string;
  description: string;
  color: string;
  examples: string;
};

export type CategoryMetaMap = Record<string, CategoryMeta>;

// Class id -> WKT polygon(s) for that class.
export type CategoryPolygons = Record<string, string>;

// GET risk/get/{id}/ (BiodiversityRiskIndexResponse).
export type BiodiversityRiskIndex = {
  id: string;
  country_code: string;
  geometry: string;
  climate_scenario: string | null;
  climate_model: string;
  period: string;
  raster_data: RasterData;
  raster_data_urban: RasterData;
  xai_raster: RasterData;
  xai_summary: Record<string, unknown>;
  risk_ling_thresholds: RiskThresholds;
  sri_species_list: string;
  sri_logic_type: string;
  sri_correction_method: string | null;
  crop_to_polygon: boolean;
  risk_model: string;
  risk_type: string;
  // Links to the related index records.
  chi: string;
  pai: string;
  sri: string;
};

// management-actions/priority/ and management-actions/get/{id}/
// (PriorityManagementActionsResponse).
export type PriorityManagementActions = {
  id: string;
  country_code: string;
  geometry: string;
  periods: string;
  climate_scenarios: string | null;
  climate_model: string;
  sri_species_list: string;
  sri_logic_type: string;
  sri_correction_method: string | null;
  risk_model: string;
  risk_type: string;
  // Link to the related BiodiversityRiskIndex record.
  risk: string;
  resilience_polygons: CategoryPolygons;
  risk_polygons: CategoryPolygons;
  recommendations_polygons: CategoryPolygons;
  recommendations_totals: Record<string, unknown>;
  recommendations_meta: CategoryMetaMap;
  resilience_dominant_class: string;
  resilience_meta: CategoryMetaMap;
  risk_meta: CategoryMetaMap;
  xai_summary: XaiSummary;
};

// A priority record with its linked risk record attached by risk.service.
export type PriorityActionsCaseResponse = PriorityManagementActions & {
  riskData: BiodiversityRiskIndex;
};

// One entry of physical-api GET /api/risk/cases/{caseId}.
export type CaseRiskEntry<TResult = PriorityManagementActions> = {
  case_id: number;
  location_id: number;
  friendly_name: string | null;
  risk_id: string | null;
  result: TResult | null;
  error: string | null;
};

// Climate-resilience fields the resilience panel shows.
export type ResilienceSummary = Pick<
  PriorityManagementActions,
  | "resilience_dominant_class"
  | "climate_scenarios"
  | "climate_model"
  | "periods"
  | "sri_logic_type"
  | "sri_correction_method"
>;
