// src/services/risk.service.ts
import {
  apiFetch,
} from "@/lib/api";
import type {
  BiodiversityRiskIndex,
  CaseRiskEntry,
  PriorityActionsCaseResponse,
  PriorityManagementActions,
} from "@/types/risk";

const BASE = "/api/vulnerability";
// const BASE = "http://localhost:8009/api/v1";
// const BASE = "http://localhost:8000/api/vulnerability";


export async function getRiskScoreByID(riskCaseURI: string) {
  // const data = await apiFetch<BiodiversityRiskIndex>(`${BASE}${riskCaseURI}`, {method: "GET"});

  // 2. Fetch the risk data using the URL from the response
  const riskJson = await apiFetch<BiodiversityRiskIndex>(`${BASE}${riskCaseURI.replace("/api/v1", "")}`);
  return riskJson;
}

export async function getPriorityManagementActions(
  country_code: string,
  polygon: string
): Promise<PriorityActionsCaseResponse> {

  // 1. Fetch priority data
    const body: Record<string, unknown> = {
      country_code: country_code,
      risk_model: "EddamiriEtAl2026",
      risk_type: "Full",
      sri_logic_type: "fuzzy",
      sri_correction_method: "HFI",
    };

    if (polygon) {
      body.wkt_polygon = polygon;
    }
  const data = await apiFetch<PriorityManagementActions>(`${BASE}/management-actions/priority/`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const riskRes = await getRiskScoreByID(data.risk);
  console.log(data);
  return { ...data, riskData: riskRes };
}

export async function getPriorityManagementActionsByID(
  entry_id: string
): Promise<PriorityActionsCaseResponse> {
  // 1. Fetch priority data by id
  const data = await apiFetch<PriorityManagementActions>(`${BASE}/management-actions/get/${entry_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const riskRes = await getRiskScoreByID(data.risk);
  console.log(data);
  return { ...data, riskData: riskRes };
}



export async function getPriorityManagementActionsByCaseID(
  case_id: string
): Promise<CaseRiskEntry<PriorityActionsCaseResponse>[]> {
  // 1. Fetch the priority record of every polygon location of the case
  const caseData = await apiFetch<CaseRiskEntry[]>(`/api/risk/cases/${case_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  // 2. Attach each location's linked risk record. Locations whose lookup
  // failed (result is null, error is set) are passed through unchanged.
  const enriched = await Promise.all(
    caseData.map(async (entry) => {
      if (!entry.result) {
        return { ...entry, result: null };
      }

      const riskRes = await getRiskScoreByID(entry.result.risk);
      return { ...entry, result: { ...entry.result, riskData: riskRes } };
    })
  );

  console.log(enriched);
  return enriched;
}


