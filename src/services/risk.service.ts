// src/services/risk.service.ts
import {
  apiFetch,
} from "@/lib/api";

const BASE = "/api/vulnerability";
// const BASE = "http://localhost:8009/api/v1";
// const BASE = "http://localhost:8000/api/vulnerability";

export type PriorityActionsCaseResponse = {
  id: string;
  riskData: any;
  [key: string]: any; // anything for now
};
export type RiskScoreCaseResponse = {
  id: string;
  [key: string]: any; // anything for now
};

export async function getRiskScoreByID(riskCaseURI: string) {
  // const data = await apiFetch<RiskScoreCaseResponse>(`${BASE}${riskCaseURI}`, {method: "GET"});

  // 2. Fetch the risk data using the URL from the response
  const riskRes = await apiFetch(`${BASE}${riskCaseURI.replace("/api/v1", "")}`);
  if (!riskRes.ok) throw new Error(`Risk fetch error: ${riskRes.status}`);
  const riskJson = await riskRes.json();
  return riskJson;
}

export async function getPriorityManagementActions(country_code: string, polygon: string) {
  // const data = await apiFetch<PriorityActionsCaseResponse>(`${BASE}/management-actions/priority/`, {
  //   method: "POST",
  //   body: JSON.stringify({
  //     country_code: country_code,
  //     // wkt_polygon: polygon,
  //     risk_model: "EddamiriEtAl2026",
  //     risk_type: "Full",
  //     sri_logic_type: "fuzzy",
  //     sri_correction_method: "HFI",
  //   }),
  // });

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
  const priorityRes = await apiFetch(`${BASE}/management-actions/priority/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!priorityRes.ok) throw new Error(`Priority fetch error: ${priorityRes.status}`);
  const data: PriorityActionsCaseResponse = await priorityRes.json();

  const riskRes = await getRiskScoreByID(data.risk);
  data.riskData = riskRes
  console.log(data);
  return data;
}

export async function getPriorityManagementActionsByID(entry_id: string) {
  // const data = await apiFetch<PriorityActionsCaseResponse>(`${BASE}/management-actions/priority/`, {
  //   method: "POST",
  //   body: JSON.stringify({
  //     country_code: country_code,
  //     // wkt_polygon: polygon,
  //     risk_model: "EddamiriEtAl2026",
  //     risk_type: "Full",
  //     sri_logic_type: "fuzzy",
  //     sri_correction_method: "HFI",
  //   }),
  // });

  // 1. Fetch priority data by id
  const priorityRes = await apiFetch(`${BASE}/management-actions/get/${entry_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!priorityRes.ok) throw new Error(`Priority fetch error: ${priorityRes.status}`);
  const data: PriorityActionsCaseResponse = await priorityRes.json();

  const riskRes = await getRiskScoreByID(data.risk);
  data.riskData = riskRes
  console.log(data);
  return data;
}


