export function getRiskLabel(value: number, thresholds: Record<string, number>) {
  const ordered = Object.entries(thresholds).sort((a, b) => a[1] - b[1]);

  let currentLabel = ordered[0]?.[0] ?? "unknown";
  for (const [label, threshold] of ordered) {
    if (value >= threshold) currentLabel = label;
  }

  return currentLabel;
}

export function prettifyRiskLabel(label: string) {
  return label
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatOneDecimalPercent(value: number) {
  return `${(value * 100).toFixed(1)}`;
}

export function ThresholdScale({
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

    return {
      label,
      start,
      end,
      width: Math.max(((end - start) / max) * 100, 6),
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
        BioFin Risk Assessment
      </p>

      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white/45">
        Biodiversity risk scale
      </h2>

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