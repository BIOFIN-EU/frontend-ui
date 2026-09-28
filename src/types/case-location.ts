export type CaseLocationCountry = {
  id: number;
  code: string;
  name: string;
};

export type CaseLocationEntry = {
  case_location_id: number;
  friendly_name: string | null;
  location_type: "polygon" | "point";
  geometry_wkt: string | null;
  latitude: number | null;
  longitude: number | null;
  area_sqm: number | null;
  area_hectares: number | null;
  area_is_manual: boolean;
  notes: string | null;
  country: CaseLocationCountry | null;
  // Risk Score Framework record id; polygons only, filled in the background.
  risk_id?: string | null;
};

export type DetectCountryRequest = {
  location_type: "polygon" | "point";
  geometry_wkt: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type DetectCountryResponse = {
  country_id: number;
  country_code: string;
  country_name: string;
  is_multiple: boolean;
};
