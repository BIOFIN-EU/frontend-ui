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
  Target,
  MapPin,
  AlertTriangle,
  Leaf,
} from "lucide-react";
// import RiskMap from "@/components/maps/RiskMap";
import ManagementActionsMap from "@/components/maps/ManagementActionsMap";
import DetailedDataPanel from "@/components/panels/DetailedDataPanel";
import GenericPanelContent from "@/components/panels/GenericPanelContent";
import BiodiversityLossAssessmentPanel from "@/components/panels/BiodiversityLossAssessmentPanel";


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
    xai_humam_text: {
      overall_risk_xai: string[];
      detailed_explanation: Array<{  // ✅ Correct type
        template: string;
        placeholders: Record<string, {
          text: string;
          data_type: string;
        }>;
      }>;
    };
  };
  risk_ling_thresholds: Record<string, number>;
  chi: string;
  pai: string;
  sri: string;
  recommendations_data?: RasterBlock;
  recommendations_polygons?: Record<string, string>;
  recommendations_summary?: {
    recommendations_meta: Record<string, {
      label: string;
      description: string;
      color: string;
      examples: string;
    }>;
  };
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
    xai_humam_text: {
      "detailed_explanation": [
        {
          "template": "This region qualifies as a {{protected_area}} with {{critical_habitat}} status and exhibits a {{species_richness}}. These characteristics collectively indicate a {{biodiversity_loss}}.",
          "placeholders": {
            "protected_area": {
              "text": "Protected Area",
              "data_type": "protected_area_assessment"
            },
            "critical_habitat": {
              "text": "likely Critical Habitat",
              "data_type": "critical_habitat_status"
            },
            "species_richness": {
              "text": "low Species Richness Index",
              "data_type": "species_richness_metrics"
            },
            "biodiversity_loss": {
              "text": "high likelihood of Biodiversity Loss",
              "data_type": "biodiversity_loss_assessment"
            }
          }
        },
        {
          "template": "Furthermore, based on {{climate_projections}} and {{urban_expansion}} modelling, this area demonstrates {{climate_resilience}} in the face of a future worst-case scenario for climate-change.",
          "placeholders": {
            "climate_projections": {
              "text": "future climate projections",
              "data_type": "climate_projection_models"
            },
            "urban_expansion": {
              "text": "projected urban expansion",
              "data_type": "urban_expansion_forecast"
            },
            "climate_resilience": {
              "text": "low climate-resilience",
              "data_type": "climate_resilience_metrics"
            }
          }
        },
        {
          "template": "Given these converging factors ({{biodiversity_loss_factors}} and {{climate_resilience_factor}}), we suggest that the following {{management_actions}} should be prioritised: Active Restoration (AR) and Passive Protection (PP). Capital allocation toward nature-positive activities within these intervention types should improve biodiversity outcomes while strengthening long-term resilience against future climate and urbanisation pressures.",
          "placeholders": {
            "biodiversity_loss_factors": {
              "text": "high likelihood of Biodiversity Loss",
              "data_type": "biodiversity_loss_assessment"
            },
            "climate_resilience_factor": {
              "text": "low climate-resilience",
              "data_type": "climate_resilience_metrics"
            },
            "management_actions": {
              "text": "Management Actions",
              "data_type": "management_priorities"
            }
          }
        }
      ]
    }
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
  recommendations_data: {
    raster: [
      [-9999.0, -9999.0, -9999.0, -9999.0, 1.0, 1.0],
      [-9999.0, -9999.0, -9999.0, -9999.0, 2.0, 2.0],
      [-9999.0, -9999.0, -9999.0, -9999.0, 1.0, 3.0],
    ],
    summary_stats: {
      mean_raster_value: 1.5,
      std_raster_value: 0.7071067811865476,
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
    }
  },
  recommendations_polygons: {
      "1": "POLYGON((4.598488763140015 52.39690261469849,4.59894780280675 52.387830068910404,4.609625654246968 52.382524758083576,4.6129675938634565 52.40769458650479,4.598488763140015 52.39690261469849))",
    "2": "POLYGON((4.609625654246968 52.382524758083576,4.625964631458413 52.38533788137002,4.620552651919607 52.39626555579616,4.6129675938634565 52.40769458650479,4.609625654246968 52.382524758083576))",
     "3": "POLYGON((4.580779754239136 52.3998410255806,4.587427106562764 52.39102720425177,4.598488763140015 52.39690261469849,4.6129675938634565 52.40769458650479,4.590386331397723 52.40737630257422,4.580779754239136 52.3998410255806))"
  },
  recommendations_summary: {
    recommendations_meta: {
      "1": {
        label: "Active Restoration (AR)",
        description: "Interventions to accelerate ecosystem recovery and enhance biodiversity outcomes",
        color: "#10b981",
        examples: "Reforestation, replantation of native species, wetland restoration, invasive species removal"
      },
      "2": {
        label: "Passive Protection (PP)",
        description: "Measures to safeguard existing habitats and prevent further degradation",
        color: "#3b82f6",
        examples: "Establish conservation easements, implement land-use policies, create buffer zones, prevent urban encroachment"
      },
      "3": {
        label: "Sustainable Management (SM)",
        description: "Balanced approaches integrating conservation with sustainable resource use",
        color: "#f59e0b",
        examples: "Sustainable harvesting quotas, certified logging practices, eco-tourism programs, community-based conservation"
      }
    }
  }
};

const panelContentMap: Record<string, React.ComponentType<any>> = {
  "biodiversity_loss_assessment": BiodiversityLossAssessmentPanel,
  // All other data types will use GenericPanelContent by default
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

  // Get unique recommendation categories present in the raster
  let recommendationCategories: number[] = [];
  if (caseData.recommendations_data) {
    const values = getValidRasterValues(
      caseData.recommendations_data.raster,
      caseData.recommendations_data.meta.nodata
    );
    recommendationCategories = [...new Set(values.map(v => Math.round(v)))].sort();
  }

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
    recommendationCategories,
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

// Commented out for now - will be used in the future
// function ThresholdScale({
//   value,
//   thresholds,
// }: {
//   value: number;
//   thresholds: Record<string, number>;
// }) {
//   // ... existing code ...
// }

function RecommendationsPanel({
  caseData,
  metrics,
}: {
  caseData: CaseData;
  metrics: ReturnType<typeof buildMetricsFromCase>;
}) {
  const getCategoryColor = (categoryId: number): string => {
    const meta = caseData.recommendations_summary?.recommendations_meta[String(categoryId)];
    return meta?.color || "#6b7280";
  };

  const getCategoryLabel = (categoryId: number): string => {
    const meta = caseData.recommendations_summary?.recommendations_meta[String(categoryId)];
    return meta?.label || `Category ${categoryId}`;
  };

  const getCategoryDescription = (categoryId: number): string => {
    const meta = caseData.recommendations_summary?.recommendations_meta[String(categoryId)];
    return meta?.description || "No description available";
  };

  const getCategoryExamples = (categoryId: number): string => {
    const meta = caseData.recommendations_summary?.recommendations_meta[String(categoryId)];
    return meta?.examples || "Site-specific management interventions";
  };

  return (
    <section className="h-full rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl bg-emerald-500/10 p-2 ring-1 ring-emerald-400/20">
          <Target className="h-5 w-5 text-emerald-200" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
            Investment prioritization
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Recommendations for Management Actions Priority
          </h2>
        </div>
      </div>

      <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
        Prioritized management actions requiring investment to enhance biodiversity through Nature Positive Actions (NPAs).
      </p>

      <div className="mt-6 space-y-4">
        {metrics.recommendationCategories.map((categoryId) => (
          <div
            key={categoryId}
            className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5 transition hover:bg-black/30"
          >
            <div className="mb-3 flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getCategoryColor(categoryId) }}
              />
              <h3
                className="text-lg font-bold"
                style={{ color: getCategoryColor(categoryId) }}
              >
                {getCategoryLabel(categoryId)}
              </h3>
            </div>

            <p className="text-sm text-white/70 mb-3">
              {getCategoryDescription(categoryId)}
            </p>

            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45 mb-2">
                Examples of Nature Positive Activities:
              </p>
              <p className="text-sm text-white/60">
                {getCategoryExamples(categoryId)}
              </p>
            </div>
          </div>
        ))}

        {metrics.recommendationCategories.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center text-white/50">
            No recommendation categories present in the current region.
          </div>
        )}
      </div>
    </section>
  );
}
function DetailedExplanation({
  caseData,
  onDataTypeClick
}: {
  caseData: CaseData;
  onDataTypeClick: (dataType: string) => void;
}) {
  const explanationBlocks = caseData.xai_summary.xai_humam_text.detailed_explanation;

  const renderBlock = (block: ExplanationBlock, blockIndex: number) => {
    let result: React.ReactNode[] = [];
    let remaining = block.template;

    // Replace placeholders one by one
    for (const [key, value] of Object.entries(block.placeholders)) {
      const parts = remaining.split(new RegExp(`{{${key}}}`, 'g'));

      if (parts.length > 1) {
        const newResult: React.ReactNode[] = [];
        for (let i = 0; i < parts.length - 1; i++) {
          if (result.length > 0) {
            newResult.push(...result);
            result = [];
          }
          newResult.push(parts[i]);
          newResult.push(
            <button
              key={`${blockIndex}-${key}-${i}`}
              onClick={() => onDataTypeClick(value.data_type)}
              className="text-emerald-400 hover:text-emerald-300 underline transition-colors cursor-pointer"
            >
              <strong className="text-emerald-300">{value.text}</strong>
            </button>
          );
        }
        result = newResult;
        remaining = parts[parts.length - 1];
      }
    }

    if (remaining) {
      result.push(remaining);
    }

    return <span className="whitespace-pre-line">{result}</span>;
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl bg-emerald-500/10 p-2 ring-1 ring-emerald-400/20">
          <AlertTriangle className="h-5 w-5 text-emerald-200" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
            Nature Positive Activities Rationale
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Detailed Explanation
          </h2>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-6 ring-1 ring-white/5">
        <div className="text-white/80 leading-relaxed space-y-4">
          {explanationBlocks.map((block, idx) => (
            <div key={idx} className="mb-4 last:mb-0">
              {renderBlock(block, idx)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Commented out for now - will be used in the future
// function HiddenStats({
//   caseData,
//   metrics,
// }: {
//   caseData: CaseData;
//   metrics: ReturnType<typeof buildMetricsFromCase>;
// }) {
//   // ... existing code ...
// }

export default function RiskModelPage() {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [polygonWkt, setPolygonWkt] = useState("");

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState("");

  const handleDataTypeClick = (dataType: string) => {
    setSelectedDataType(dataType);
    setIsPanelOpen(true);
  };

  // Determine which panel content to render
  const PanelContent = panelContentMap[selectedDataType] || GenericPanelContent;
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
            BioFIN's Management Activities Recommendations
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Management Activities Recommendations
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
                  Spatial analysis
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  Priority Management Actions by Region
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10">
                <MapPin className="h-3.5 w-3.5" />
                Management action areas displayed
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#07121d] ring-1 ring-white/5">
              <ManagementActionsMap
                polygonWkt={polygonWkt}
                recommendationsPolygons={caseData.recommendations_polygons}
                recommendationsMeta={caseData.recommendations_summary.recommendations_meta}
              />
            </div>
          </section>

          <RecommendationsPanel caseData={caseData} metrics={metrics} />
        </div>

        {/* Update this line */}
        <DetailedExplanation
          caseData={caseData}
          onDataTypeClick={handleDataTypeClick}
        />

      <DetailedDataPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)}>

        <PanelContent
          dataType={selectedDataType}
          onClose={() => setIsPanelOpen(false)}
          {...(selectedDataType === "biodiversity_loss_assessment" && {
            riskMean: metrics.riskMean,
            thresholds: caseData.risk_ling_thresholds,
            caseData: {
              risk_model: caseData.risk_model,
              period: caseData.period,
              risk_type: caseData.risk_type,
              sri_logic_type: caseData.sri_logic_type,
              sri_correction_method: caseData.sri_correction_method,
              climate_model: caseData.climate_model,
            }
          })}
        />
      </DetailedDataPanel>
      </div>
    </div>
  );
}
