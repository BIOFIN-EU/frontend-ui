"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Info, ShieldAlert, Bird, Trees } from "lucide-react";
import RiskMap from "@/components/maps/RiskMap";

type CaseData = {
  id: string;
  country_code: string;
  geometry: string;
  climate_scenario: string | null;
  climate_model: string;
  period: string;
  risk_model: string;
  risk_type: string;
  sri_logic_type: string;
  sri_correction_method: string;
  sri_species_list: string;
  crop_to_polygon: boolean;
  raster_data: RasterBlock;
  raster_data_urban: RasterBlock;
  xai_raster: RasterBlock;
  xai_summary: {
    xai_meta: Record<string, string>;
    xai_humam_text: string[];
  };
  risk_ling_thresholds: Record<string, number>;
  chi: string;
  pai: string;
  sri: string;
};

type RasterBlock = {
  raster: number[][];
  summary_stats: {
    mean_raster_value: number;
    std_raster_value: number;
  };
  meta: {
    nodata: number;
    width: number;
    height: number;
    crs: string;
    transform: number[];
    dtype: string;
    driver: string;
    count: number;
    compress?: string;
    predictor?: number;
  };
};

const HARDCODED_CASE: CaseData = {
  id: "4b1f3ff4-a3ac-4caf-a066-c95f7dd95c11",
  country_code: "NL",
  geometry:
    "POLYGON((4.598488763140015 52.39690261469849,4.59894780280675 52.387830068910404,4.609625654246968 52.382524758083576,4.625964631458413 52.38533788137002,4.620552651919607 52.39626555579616,4.6129675938634565 52.40769458650479,4.590386331397723 52.40737630257422,4.580779754239136 52.3998410255806,4.587427106562764 52.39102720425177,4.598488763140015 52.39690261469849))",
  climate_scenario: null,
  climate_model: "current",
  period: "current",
  risk_model: "PontesEtAl2026",
  risk_type: "NonPA",
  sri_logic_type: "fuzzy",
  sri_correction_method: "HFI",
  crop_to_polygon: true,
  chi: "/api/v1/others/chi/get/7b8669b2-814c-47fd-92c5-9f2e26c950a7/",
  pai: "/api/v1/others/pai/get/f6daa514-47bb-4d3d-b705-ade645c78624/",
  sri: "/api/v1/sri/get/630e8f43-35e5-403e-9dc4-430f52114f0c/",
  raster_data: {
    raster: [
      [-9999.0, -9999.0, -9999.0, -9999.0, 0.29896304660946366, 0.29882301656495286],
      [-9999.0, -9999.0, -9999.0, -9999.0, -9999.0, -9999.0],
      [-9999.0, -9999.0, -9999.0, -9999.0, -9999.0, -9999.0],
    ],
    summary_stats: {
      mean_raster_value: 0.29889303158720826,
      std_raster_value: 7.001502225539857e-05,
    },
    meta: {
      driver: "GTiff",
      dtype: "float32",
      nodata: -9999.0,
      width: 6,
      height: 3,
      count: 1,
      crs: 'GEOGCS["WGS 84"...]',
      transform: [
        0.008983152841195215,
        0.0,
        4.572424796168365,
        0.0,
        -0.008983152841195215,
        52.40771367553288,
        0.0,
        0.0,
        1.0,
      ],
      compress: "DEFLATE",
      predictor: 3,
    },
  },
  raster_data_urban: {
    raster: [
      [-9999.0, -9999.0, -9999.0, -9999.0, -9999.0, -9999.0],
      [-9999.0, -9999.0, -9999.0, -9999.0, 0.29882301656495286, 0.29882301656495286],
      [-9999.0, -9999.0, -9999.0, -9999.0, 0.29882301656495286, 0.29882301656495286],
    ],
    summary_stats: {
      mean_raster_value: 0.29882301656495286,
      std_raster_value: 0.0,
    },
    meta: {
      driver: "GTiff",
      dtype: "float32",
      nodata: -9999.0,
      width: 6,
      height: 3,
      count: 1,
      crs: 'GEOGCS["WGS 84"...]',
      transform: [
        0.008983152841195215,
        0.0,
        4.572424796168365,
        0.0,
        -0.008983152841195215,
        52.40771367553288,
        0.0,
        0.0,
        1.0,
      ],
      compress: "DEFLATE",
      predictor: 3,
    },
  },
  xai_raster: {
    raster: [
      [-9999.0, -9999.0, -9999.0, -9999.0, 4.0, 4.0],
      [-9999.0, -9999.0, -9999.0, -9999.0, 4.0, 4.0],
      [-9999.0, -9999.0, -9999.0, -9999.0, 4.0, 4.0],
    ],
    summary_stats: {
      mean_raster_value: -1.0,
      std_raster_value: -1.0,
    },
    meta: {
      driver: "GTiff",
      dtype: "float32",
      nodata: -9999.0,
      width: 6,
      height: 3,
      count: 1,
      crs: 'GEOGCS["WGS 84"...]',
      transform: [
        0.008983152841195215,
        0.0,
        4.572424796168365,
        0.0,
        -0.008983152841195215,
        52.40771367553288,
        0.0,
        0.0,
        1.0,
      ],
      compress: "DEFLATE",
      predictor: 3,
    },
  },
  xai_summary: {
    xai_meta: {
      "0": "IF (ch[unknown] AND pa[unprotected]) AND si[high] THEN risk[low]",
      "1": "IF (ch[unknown] AND pa[unprotected]) AND si[medium-high] THEN risk[medium-low]",
      "2": "IF (ch[unknown] AND pa[unprotected]) AND si[medium] THEN risk[medium-low]",
      "3": "IF (ch[unknown] AND pa[unprotected]) AND si[medium-low] THEN risk[medium-low]",
      "4": "IF (ch[unknown] AND pa[unprotected]) AND si[low] THEN risk[medium-low]",
      "5": "IF (ch[potential] AND pa[unprotected]) AND si[high] THEN risk[medium-low]",
      "6": "IF (ch[potential] AND pa[unprotected]) AND si[medium-high] THEN risk[medium-low]",
      "7": "IF (ch[potential] AND pa[unprotected]) AND si[medium] THEN risk[medium]",
      "8": "IF (ch[potential] AND pa[unprotected]) AND si[medium-low] THEN risk[medium-high]",
      "9": "IF (ch[potential] AND pa[unprotected]) AND si[low] THEN risk[medium-high]",
      "10": "IF (ch[likely] AND pa[unprotected]) AND si[high] THEN risk[medium-low]",
      "11": "IF (ch[likely] AND pa[unprotected]) AND si[medium-high] THEN risk[medium]",
      "12": "IF (ch[likely] AND pa[unprotected]) AND si[medium] THEN risk[medium-high]",
      "13": "IF (ch[likely] AND pa[unprotected]) AND si[medium-low] THEN risk[medium-high]",
      "14": "IF (ch[likely] AND pa[unprotected]) AND si[low] THEN risk[high]",
      "15": "IF (ch[unknown] AND pa[protected]) AND si[high] THEN risk[medium]",
      "16": "IF (ch[unknown] AND pa[protected]) AND si[medium-high] THEN risk[medium]",
      "17": "IF (ch[unknown] AND pa[protected]) AND si[medium] THEN risk[medium-high]",
      "18": "IF (ch[unknown] AND pa[protected]) AND si[medium-low] THEN risk[high]",
      "19": "IF (ch[unknown] AND pa[protected]) AND si[low] THEN risk[high]",
      "20": "IF (ch[potential] AND pa[protected]) AND si[high] THEN risk[medium-high]",
      "21": "IF (ch[potential] AND pa[protected]) AND si[medium-high] THEN risk[medium-high]",
      "22": "IF (ch[potential] AND pa[protected]) AND si[medium] THEN risk[high]",
      "23": "IF (ch[potential] AND pa[protected]) AND si[medium-low] THEN risk[high]",
      "24": "IF (ch[potential] AND pa[protected]) AND si[low] THEN risk[high]",
      "25": "IF (ch[likely] AND pa[protected]) AND si[high] THEN risk[medium-high]",
      "26": "IF (ch[likely] AND pa[protected]) AND si[medium-high] THEN risk[medium-high]",
      "27": "IF (ch[likely] AND pa[protected]) AND si[medium] THEN risk[high]",
      "28": "IF (ch[likely] AND pa[protected]) AND si[medium-low] THEN risk[high]",
      "29": "IF (ch[likely] AND pa[protected]) AND si[low] THEN risk[high]",
    },
    xai_humam_text: [],
  },
  risk_ling_thresholds: {
    low: 0.09285714285714287,
    "medium-low": 0.25000000000000006,
    medium: 0.5,
    "medium-high": 0.7500000000000001,
    high: 0.9458333333333333,
  },
  sri_species_list:
    "Accipiter nisus,Aegithalos caudatus,Anthus trivialis,Buteo buteo,Certhia brachydactyla,Coccothraustes coccothraustes,Dendrocopos major,Dendrocopos minor,Garrulus glandarius,Lullula arborea,Luscinia megarhynchos,Oriolus oriolus,Periparus ater,Phoenicurus phoenicurus,Picus viridis,Regulus regulus,Streptopelia turtur,Sylvia borin",
};

function getValidRasterValues(raster: number[][], nodata: number) {
  return raster.flat().filter((v) => v !== nodata);
}

function getRiskLabel(value: number, thresholds: Record<string, number>) {
  const ordered = Object.entries(thresholds).sort((a, b) => a[1] - b[1]);

  let currentLabel = ordered[0]?.[0] ?? "unknown";
  for (const [label, threshold] of ordered) {
    if (value >= threshold) {
      currentLabel = label;
    }
  }

  return currentLabel;
}

function prettifyRiskLabel(label: string) {
  return label
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildMetricsFromCase(caseData: CaseData) {
  const riskMean = caseData.raster_data.summary_stats.mean_raster_value;
  const riskStd = caseData.raster_data.summary_stats.std_raster_value;
  const urbanMean = caseData.raster_data_urban.summary_stats.mean_raster_value;
  const urbanStd = caseData.raster_data_urban.summary_stats.std_raster_value;

  const xaiValues = getValidRasterValues(
    caseData.xai_raster.raster,
    caseData.xai_raster.meta.nodata
  );

  const dominantRuleIndex = xaiValues.length ? String(Math.round(xaiValues[0])) : null;
  const dominantRule = dominantRuleIndex
    ? caseData.xai_summary.xai_meta[dominantRuleIndex] ?? null
    : null;

  const species = caseData.sri_species_list
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    riskLabel: prettifyRiskLabel(
      getRiskLabel(riskMean, caseData.risk_ling_thresholds)
    ),
    dominantRule,
    species,
    riskMean,
    riskStd,
    urbanMean,
    urbanStd,
    riskScore: Math.round(riskMean * 100),
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          {label}
        </p>
        <Icon className="h-4 w-4 text-emerald-200" />
      </div>
      <p className="mt-3 break-all text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function RiskModelPage() {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [polygonWkt, setPolygonWkt] = useState("");

  useEffect(() => {
    // later:
    // fetch(`/api/v1/cases/${caseId}`)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     setCaseData(data);
    //     setPolygonWkt(data.geometry || "");
    //   });

    setCaseData(HARDCODED_CASE);
    setPolygonWkt(HARDCODED_CASE.geometry || "");
  }, []);

  const metrics = useMemo(() => {
    if (!caseData) return null;
    return buildMetricsFromCase(caseData);
  }, [caseData]);

  if (!caseData || !metrics) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_25%),linear-gradient(180deg,#07111a_0%,#09131d_100%)] text-white">
        <div className="mx-auto max-w-7xl px-6 py-8">Loading case...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_25%),linear-gradient(180deg,#07111a_0%,#09131d_100%)] text-white">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <header className="space-y-4">
          <div className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
            Biodiversity risk model
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Biodiversity Risk Explorer
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
                Dynamic case-driven biodiversity dashboard based only on values
                present in the returned JSON.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              <div>Case ID: {caseData.id}</div>
              <div>Country: {caseData.country_code}</div>
            </div>
          </div>
        </header>
      <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Interactive map
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Spatial biodiversity screening
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10">
            <Info className="h-3.5 w-3.5" />
            Polygon loaded from case geometry
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#07121d] ring-1 ring-white/5">
          <RiskMap
            polygonWkt={polygonWkt}
            onPolygonWktChange={setPolygonWkt}
          />
        </div>

  <div className="mt-4 grid gap-4 sm:grid-cols-1">
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Risk score
        </p>
        <ShieldAlert className="h-4 w-4 text-red-200" />
      </div>
      <p className="mt-3 text-3xl font-semibold">{metrics.riskScore}</p>
      <p className="mt-1 text-xs text-white/45">Rounded from raster mean</p>
    </div>
  </div>
</section>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                    Case summary
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">{caseData.id}</h3>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <StatCard
                  label="Risk label"
                  value={metrics.riskLabel}
                  icon={ShieldAlert}
                />
                <StatCard
                  label="Crop to polygon"
                  value={caseData.crop_to_polygon ? "Yes" : "No"}
                  icon={Info}
                />
                <StatCard
                  label="Climate model"
                  value={caseData.climate_model}
                  icon={Info}
                />
                <StatCard
                  label="Period"
                  value={caseData.period}
                  icon={Info}
                />
                <StatCard
                  label="Risk model"
                  value={caseData.risk_model}
                  icon={Info}
                />
                <StatCard
                  label="Risk type"
                  value={caseData.risk_type}
                  icon={Info}
                />
                <StatCard
                  label="SRI logic type"
                  value={caseData.sri_logic_type}
                  icon={Info}
                />
                <StatCard
                  label="SRI correction method"
                  value={caseData.sri_correction_method}
                  icon={Info}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Raster summaries
              </p>
              <h3 className="mt-1 text-xl font-semibold">Returned summary stats</h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <StatCard
                  label="Raster mean"
                  value={metrics.riskMean}
                  icon={ShieldAlert}
                />
                <StatCard
                  label="Raster std dev"
                  value={metrics.riskStd}
                  icon={Info}
                />
                <StatCard
                  label="Urban raster mean"
                  value={metrics.urbanMean}
                  icon={Info}
                />
                <StatCard
                  label="Urban raster std dev"
                  value={metrics.urbanStd}
                  icon={Info}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                XAI
              </p>
              <h3 className="mt-1 text-xl font-semibold">Dominant rule</h3>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                <p className="text-sm text-white/80">
                  {metrics.dominantRule ?? "No explanation rule available."}
                </p>
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Thresholds
              </p>
              <h3 className="mt-1 text-xl font-semibold">Risk linguistic thresholds</h3>

              <div className="mt-4 space-y-3">
                {Object.entries(caseData.risk_ling_thresholds)
                  .sort((a, b) => a[1] - b[1])
                  .map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 ring-1 ring-white/5"
                    >
                      <span className="text-sm text-white/70">{label}</span>
                      <span className="text-sm font-semibold text-white">{value}</span>
                    </div>
                  ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Species
              </p>
              <div className="mt-4 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-100">
                    <Trees className="h-4 w-4" /> SRI species list
                  </div>
                  <ul className="space-y-2 text-sm text-white/70">
                    {metrics.species.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Linked resources
              </p>
              <h3 className="mt-1 text-xl font-semibold">Related endpoints</h3>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                  <p className="text-xs font-medium text-white/55">CHI</p>
                  <p className="mt-1 break-all text-sm font-semibold text-white">{caseData.chi}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                  <p className="text-xs font-medium text-white/55">PAI</p>
                  <p className="mt-1 break-all text-sm font-semibold text-white">{caseData.pai}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                  <p className="text-xs font-medium text-white/55">SRI</p>
                  <p className="mt-1 break-all text-sm font-semibold text-white">{caseData.sri}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Raster metadata
              </p>
              <h3 className="mt-1 text-xl font-semibold">Raster info</h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <StatCard
                  label="Driver"
                  value={caseData.raster_data.meta.driver}
                  icon={Info}
                />
                <StatCard
                  label="Dtype"
                  value={caseData.raster_data.meta.dtype}
                  icon={Info}
                />
                <StatCard
                  label="NoData"
                  value={caseData.raster_data.meta.nodata}
                  icon={Info}
                />
                <StatCard
                  label="Width"
                  value={caseData.raster_data.meta.width}
                  icon={Info}
                />
                <StatCard
                  label="Height"
                  value={caseData.raster_data.meta.height}
                  icon={Info}
                />
                <StatCard
                  label="Band count"
                  value={caseData.raster_data.meta.count}
                  icon={Bird}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}