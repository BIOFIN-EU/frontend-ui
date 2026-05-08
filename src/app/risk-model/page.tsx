"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Info,
  ShieldAlert,
  Bird,
  Trees,
  ChevronDown,
  ChevronUp,
  Database,
} from "lucide-react";
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
    xai_humam_text: ["IF it is Not a Protected Area AND Critical Habitat is 'Unknown' AND Species Richness is 'High' THEN Risk is 'Low'"],
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

function formatOneDecimalPercent(value: number) {
  return `${(value * 100).toFixed(1)}`;
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
    riskScore: Number((riskMean * 100).toFixed(1)),
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

function ThresholdScale({
  value,
  thresholds,
}: {
  value: number;
  thresholds: Record<string, number>;
}) {
  const ordered = Object.entries(thresholds).sort((a, b) => a[1] - b[1]);
  const max = 1;

  const segments = ordered.map(([label, start], index) => {
    const end = ordered[index + 1]?.[1] ?? max;
    const width = Math.max(((end - start) / max) * 100, 6);

    return {
      label,
      start,
      end,
      width,
    };
  });

  const markerPosition = Math.min(Math.max(value * 100, 0), 100);
  const activeLabel = prettifyRiskLabel(getRiskLabel(value, thresholds));

  const segmentTone = (label: string) => {
    switch (label) {
      case "low":
        return "from-emerald-500 to-emerald-400";
      case "medium-low":
        return "from-lime-500 to-yellow-400";
      case "medium":
        return "from-yellow-500 to-amber-400";
      case "medium-high":
        return "from-orange-500 to-orange-400";
      case "high":
        return "from-red-500 to-rose-500";
      default:
        return "from-white/20 to-white/10";
    }
  };

  return (
    <section className="h-full rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
        Risk linguistic thresholds
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight">
        Biodiversity risk scale
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
        The raster mean is shown on the linguistic threshold scale as a percentage.
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/45">
              Current position
            </p>
            <p className="mt-1 text-3xl font-semibold text-white">
              {formatOneDecimalPercent(value)}
            </p>
          </div>
          <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/20">
            {activeLabel}
          </div>
        </div>

        <div className="mt-8">
          <div className="relative">
            <div className="flex h-6 overflow-hidden rounded-full border border-white/10 bg-white/5">
              {segments.map((segment) => (
                <div
                  key={segment.label}
                  className={`h-full bg-gradient-to-r ${segmentTone(segment.label)}`}
                  style={{ width: `${segment.width}%` }}
                  title={`${prettifyRiskLabel(segment.label)}: ${formatOneDecimalPercent(
                    segment.start
                  )}% → ${formatOneDecimalPercent(segment.end)}%`}
                />
              ))}
            </div>

            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${markerPosition}%` }}
            >
              <div className="flex flex-col items-center">
                <div className="mb-1 rounded-full border border-emerald-300/40 bg-[#07121d] px-2.5 py-1 text-[10px] font-semibold text-emerald-200 shadow-lg">
                  {formatOneDecimalPercent(value)}
                </div>
                <div className="h-8 w-[2px] bg-white" />
                <div className="h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.75)]" />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-5">
            {segments.map((segment, index) => {
              const isCurrent =
                (value >= segment.start && value < segment.end) ||
                (index === segments.length - 1 && value >= segment.start);

              return (
                <div
                  key={segment.label}
                  className={`rounded-2xl border px-3 py-3 ring-1 ${
                    isCurrent
                      ? "border-emerald-400/30 bg-emerald-500/10 ring-emerald-400/20"
                      : "border-white/10 bg-white/[0.03] ring-white/5"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/55">
                    {prettifyRiskLabel(segment.label)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    ≥ {formatOneDecimalPercent(segment.start)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function HiddenStats({
  caseData,
  metrics,
}: {
  caseData: CaseData;
  metrics: ReturnType<typeof buildMetricsFromCase>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left ring-1 ring-white/5 transition hover:bg-black/30"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-2xl bg-emerald-500/10 p-2 ring-1 ring-emerald-400/20">
            <Database className="h-4 w-4 text-emerald-200" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Hidden stats
            </p>
            <h3 className="mt-1 text-xl font-semibold">
              Technical metadata and supporting details
            </h3>
            <p className="mt-1 text-sm text-white/60">
              Includes case summary, thresholds, raster summaries, endpoints, raster metadata, and XAI.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 ring-1 ring-white/10">
          {open ? "Hide details" : "Show details"}
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="mt-5 space-y-6">
          <section className="rounded-3xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Case summary
            </p>
            <h4 className="mt-1 text-lg font-semibold">{caseData.id}</h4>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              <StatCard label="Period" value={caseData.period} icon={Info} />
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

          <section className="rounded-3xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Thresholds
            </p>
            <h4 className="mt-1 text-lg font-semibold">Risk linguistic thresholds</h4>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {Object.entries(caseData.risk_ling_thresholds)
                .sort((a, b) => a[1] - b[1])
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 ring-1 ring-white/5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                      {prettifyRiskLabel(label)}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {formatOneDecimalPercent(value)}
                    </p>
                  </div>
                ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Raster summaries
            </p>
            <h4 className="mt-1 text-lg font-semibold">Returned summary stats</h4>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Raster mean"
                value={formatOneDecimalPercent(metrics.riskMean)}
                icon={ShieldAlert}
              />
              <StatCard
                label="Raster std dev"
                value={formatOneDecimalPercent(metrics.riskStd)}
                icon={Info}
              />
              <StatCard
                label="Urban raster mean"
                value={formatOneDecimalPercent(metrics.urbanMean)}
                icon={Info}
              />
              <StatCard
                label="Urban raster std dev"
                value={formatOneDecimalPercent(metrics.urbanStd)}
                icon={Info}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              XAI
            </p>
            <h4 className="mt-1 text-lg font-semibold">Dominant rule</h4>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 ring-1 ring-white/5">
              <p className="text-sm text-white/80">
                {metrics.dominantRule ?? "No explanation rule available."}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Linked resources
            </p>
            <h4 className="mt-1 text-lg font-semibold">Related endpoints</h4>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 ring-1 ring-white/5">
                <p className="text-xs font-medium text-white/55">CHI</p>
                <p className="mt-1 break-all text-sm font-semibold text-white">{caseData.chi}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 ring-1 ring-white/5">
                <p className="text-xs font-medium text-white/55">PAI</p>
                <p className="mt-1 break-all text-sm font-semibold text-white">{caseData.pai}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 ring-1 ring-white/5">
                <p className="text-xs font-medium text-white/55">SRI</p>
                <p className="mt-1 break-all text-sm font-semibold text-white">{caseData.sri}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Raster metadata
            </p>
            <h4 className="mt-1 text-lg font-semibold">Raster info</h4>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        </div>
      )}
    </section>
  );
}

export default function RiskModelPage() {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [polygonWkt, setPolygonWkt] = useState("");

  useEffect(() => {
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
            BioFIN's Management Activities Recomendations
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Biodiversity Risk Explorer
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
                Example case loaded with hardcoded data.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              <div>Case ID: {caseData.id}</div>
              <div>Country: {caseData.country_code}</div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-stretch">
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
          </section>

          <ThresholdScale
            value={metrics.riskMean}
            thresholds={caseData.risk_ling_thresholds}
          />
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
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

          <HiddenStats caseData={caseData} metrics={metrics} />
        </div>
      </div>
    </div>
  );
}
