// components/panels/BiodiversityLossAssessmentPanel.tsx
import React from "react";
import { X, ShieldAlert } from "lucide-react";

// Types
type Thresholds = Record<string, number>;

function getRiskLabel(value: number, thresholds: Thresholds) {
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
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
            Risk linguistic thresholds
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">
            Biodiversity risk scale
          </h3>
        </div>
        <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/20">
          {activeLabel}
        </div>
      </div>

      <p className="mb-4 text-sm leading-6 text-white/65">
        The raster mean is shown on the linguistic threshold scale as a percentage.
      </p>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/45">
              Current position
            </p>
            <p className="mt-1 text-3xl font-semibold text-white">
              {formatOneDecimalPercent(value)}
            </p>
          </div>
        </div>

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
  );
}

interface BiodiversityLossAssessmentPanelProps {
  dataType: string;
  onClose: () => void;
  riskMean?: number;
  thresholds?: Record<string, number>;
  caseData?: {
    risk_model: string;
    period: string;
    risk_type: string;
    sri_logic_type: string;
    sri_correction_method: string;
  };
}

export default function BiodiversityLossAssessmentPanel({
  dataType,
  onClose,
  riskMean,
  thresholds,
  caseData,
}: BiodiversityLossAssessmentPanelProps) {
  // Use passed data from page.tsx or fallback to hardcoded values
  const riskValue = riskMean;
  const riskThresholds = thresholds;

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-md p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
            Assessment Details
          </p>
          <div className="flex items-center gap-2 mt-1">
            <ShieldAlert className="h-5 w-5 text-red-400" />
            <h2 className="text-2xl font-semibold tracking-tight">
              Biodiversity Loss Assessment
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
        {/* Threshold Scale Component - now using passed data */}
        <ThresholdScale value={riskValue} thresholds={riskThresholds} />

        {/* Additional Assessment Info */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
          <h3 className="text-lg font-semibold text-emerald-200 mb-3">
            Assessment Criteria
          </h3>
          <p className="text-sm leading-relaxed text-white/70">
            This assessment evaluates the likelihood of biodiversity loss based on habitat degradation, species population trends, and ecosystem fragmentation indicators. The risk scale combines multiple data sources including CHI (Critical Habitat Index), PAI (Protected Area Index), and SRI (Species Richness Index).
          </p>

          {/* Model Configuration */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-emerald-200 mb-2">Model Configuration</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-white/45">Vulnerability Index</p>
                <p className="text-white/80 font-medium">{caseData?.risk_model}</p>
              </div>
              <div>
                <p className="text-xs text-white/45">Time Period</p>
                <p className="text-white/80 font-medium">{caseData?.period ?? "Current"}</p>
              </div>
              <div>
                <p className="text-xs text-white/45">SRI Logic</p>
                <p className="text-white/80 font-medium">{caseData?.sri_logic_type} / {caseData?.sri_correction_method ?? "HFI"}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Risk Interpretation */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
          <h3 className="text-lg font-semibold text-emerald-200 mb-3">
            Risk Interpretation
          </h3>

          {/* High Risk Explanation */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-red-400 mb-2">High Risk Meaning</h4>
            <p className="text-sm leading-relaxed text-white/70">
              The biodiversity risk score represents the probability of irreversible ecosystem degradation and species decline under current land-use and climate trajectories. A higher risk value indicates greater exposure to biodiversity loss drivers, suggesting material negative impacts on natural capital assets. In the absence of targeted Nature Positive interventions, regions exhibiting elevated risk scores face heightened likelihood of biodiversity depreciation, potentially affecting ecosystem service valuations and long-term portfolio sustainability.
            </p>
          </div>

          {/* Low Risk Explanation */}
          <div className="mb-4 pt-3 border-t border-white/10">
            <h4 className="text-sm font-semibold text-emerald-400 mb-2">Low Risk Meaning</h4>
            <p className="text-sm leading-relaxed text-white/70">
              Conversely, a lower risk score suggests relatively stable ecological conditions with reduced pressure on biodiversity assets. Such regions demonstrate greater resilience to anthropogenic and climatic stressors, indicating lower probability of imminent ecosystem service degradation. These areas may require primarily Passive Protection strategies rather than intensive Active Restoration, potentially representing lower-cost conservation opportunities with established natural capital buffers.
            </p>
          </div>

        </div>

      </div>
    </>
  );
}
