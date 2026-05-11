// components/panels/ClimateResiliencePanel.tsx
import React from "react";
import { X, Thermometer, BookOpen, Link as LinkIcon, Calendar, TrendingUp } from "lucide-react";

interface ClimateResiliencePanelProps {
  dataType: string;
  onClose: () => void;
  caseData?: {
    climate_model: string;
    climate_scenario: string | null;
    period: string;
    country_code: string;
  };
  recommendationsMeta?: Record<string, {
    label: string;
    description: string;
    color: string;
    examples: string;
  }>;
}

export default function ClimateResiliencePanel({
  dataType,
  onClose,
  caseData,
  recommendationsMeta,
}: ClimateResiliencePanelProps) {
  // 5x5 Matrix: Climate Resiliency (rows) vs Biodiversity Risk (columns)
  const matrix = [
    // High Resiliency
    ["AP I", "AP I", "AP II", "AP II", "PP"],
    // Medium-High Resiliency
    ["AR I", "AR I", "AR II", "AR II", "PR"],
    // Medium Resiliency
    ["AR I", "AR I", "AR II", "AR II", "PR"],
    // Medium-Low Resiliency
    ["AR I", "AR I", "AR II", "AR II", "PR"],
    // Low Resiliency
    ["Low Priority", "Low Priority", "Low Priority", "Low Priority", "Low Priority"]
  ];


  const riskLevels = ["high", "medium-high", "medium", "medium-low", "low"];
  const resiliencyLevels =  ["high", "medium-high", "medium", "medium-low", "low"];

const getCellColor = (value: string) => {
  if (value === "Low Priority") {
    return "bg-gray-700 text-white/50";
  }

  // Find metadata by matching label_short
  const meta = Object.values(recommendationsMeta || {}).find(m => m.label_short === value);

  if (!meta) return "bg-gray-800 text-white";

  // Return appropriate classes based on the color
  // Map the color values to Tailwind classes
  switch (meta.color) {
    case "#135d18": // AP I
      return "bg-[#135d18] text-white";
    case "#0cc02a": // AP II
      return "bg-[#0cc02a] text-white";
    case "#86efac": // PP
      return "bg-[#86efac] text-gray-900";
    case "#eab308": // AR I
      return "bg-[#eab308] text-gray-900";
    case "#f97316": // AR II
      return "bg-[#f97316] text-white";
    case "#dc2626": // PR
      return "bg-[#dc2626] text-white";
    default:
      return "bg-gray-800 text-white";
  }
};

const getActionDescription = (value: string) => {
  if (value === "Low Priority") {
    return "Low Priority - No immediate action required";
  }

  const meta = Object.values(recommendationsMeta || {}).find(m => m.label_short === value);
  return meta?.label ?? value;
};

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-md p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
            Climate Analysis
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Thermometer className="h-5 w-5 text-orange-400" />
            <h2 className="text-2xl font-semibold tracking-tight">
              Climate Resilience Metrics
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 hover:bg-white/10 transition-colors ring-1 ring-white/10"
        >
          <X className="h-5 w-5 text-white/70" />
        </button>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-80px)] overflow-y-auto p-6 space-y-6 pb-32">
        {/* Climate Resilience Overview */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
          <h3 className="text-lg font-semibold text-emerald-200 mb-3">
            Climate Resilience Assessment
          </h3>
          <p className="text-sm leading-relaxed text-white/70 mb-4">
            Climate resilience is assessed by integrating habitat risk and landscape resilience to determine priority management actions. The BioFIN Biodiversity Risk Model evaluates current habitat risk levels, while landscape resilience is derived from Species Richness Index (SRI) projections under future climate scenarios.
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            This combined approach enables identification of zones requiring active protection, passive protection, active restoration, or passive restoration based on their resilience trajectory and current risk exposure.
          </p>
        </div>

        {/* Model Configuration */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
          <h3 className="text-lg font-semibold text-emerald-200 mb-3">
            Model Configuration
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-white/45">Climate Model</p>
              <p className="text-white/80 font-medium">{caseData?.climate_model ?? "current"}</p>
            </div>
            <div>
              <p className="text-xs text-white/45">Climate Scenario</p>
              <p className="text-white/80 font-medium">{caseData?.climate_scenario ?? "SSP585 (worst-case)"}</p>
            </div>
            <div>
              <p className="text-xs text-white/45">Time Period</p>
              <p className="text-white/80 font-medium">{caseData?.period ?? "current"}</p>
            </div>
            <div>
              <p className="text-xs text-white/45">Country Code</p>
              <p className="text-white/80 font-medium">{caseData?.country_code ?? "NL"}</p>
            </div>
          </div>
        </div>

        {/* Future Projections */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-emerald-200">
              Future Projections (2040 & 2060)
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-white/70 mb-4">
            Future Species Richness Index calculations are trained using an ensemble of models under the SSP585 ("worst-case") climate scenario, ensuring a cautious and conservative approach to climate resilience assessment. These projections are subsequently corrected using the Human Footprint Index (HFI) to account for anticipated anthropogenic pressures.
          </p>
          <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-400" />
              <p className="text-xs font-semibold text-orange-300 uppercase tracking-wider">Methodology Note</p>
            </div>
            <p className="text-xs text-white/60">
              Ensemble modeling reduces prediction uncertainty by aggregating multiple model outputs. The SSP585 scenario represents a high-emission trajectory with radiative forcing reaching 8.5 W/m² by 2100.
            </p>
          </div>
        </div>

        {/* Management Priority Framework - 5x5 Matrix */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
          <h3 className="text-lg font-semibold text-emerald-200 mb-4">
            Management Priority Framework
          </h3>
          <p className="text-sm text-white/60 mb-4">
            Decision matrix combining Climate Resiliency (vertical axis) vs Biodiversity Risk (horizontal axis):
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              {/* Header row */}
              <thead>
                <tr>
                  <th className="p-2 text-left text-white/60 font-medium bg-black/40 rounded-tl-xl">
                    Climate Resiliency ↓ / Biodiversity Risk →
                  </th>
                  {riskLevels.map((risk) => (
                    <th key={risk} className="p-2 text-center text-white/60 font-medium bg-black/40">
                      {risk.charAt(0).toUpperCase() + risk.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resiliencyLevels.map((resiliency, rowIndex) => (
                  <tr key={resiliency}>
                    <td className="p-2 font-medium text-white/80 bg-black/30 border-r border-white/10">
                      {resiliency.charAt(0).toUpperCase() + resiliency.slice(1)}
                    </td>
                    {matrix[rowIndex].map((value, colIndex) => (
                      <td
                        key={`${rowIndex}-${colIndex}`}
                        className={`p-2 text-center border border-white/5 ${getCellColor(value)}`}
                        title={getActionDescription(value)}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white/70 mb-3">Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#166534]"></div>
                <span className="text-white/60">API - Active Protection I</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#22c55e]"></div>
                <span className="text-white/60">APII - Active Protection II</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#86efac]"></div>
                <span className="text-white/60">PP - Passive Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#eab308]"></div>
                <span className="text-white/60">ARI - Active Restoration I</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#f97316]"></div>
                <span className="text-white/60">ARII - Active Restoration II</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#dc2626]"></div>
                <span className="text-white/60">PR - Passive Restoration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-700"></div>
                <span className="text-white/60">Low Priority</span>
              </div>
            </div>
          </div>
        </div>

        {/* Methodology Reference */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-emerald-200">
              Methodology & Reference
            </h3>
            <BookOpen className="h-4 w-4 text-white/40" />
          </div>
          <p className="text-sm leading-relaxed text-white/70 mb-3">
            This climate resilience framework integrates habitat risk and landscape resilience to prioritize management actions. The methodology follows established approaches for mapping priority areas for protection and restoration under climate change scenarios.
          </p>
          <a
            href="https://doi.org/10.1016/j.landurbplan.2024.105111"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>10.1016/j.landurbplan.2024.105111 - Landscape and Urban Planning</span>
          </a>
        </div>
      </div>
    </>
  );
}
