"use client";

import { useEffect, useState } from "react";
import { bngService } from "@/services/bng.service";
import type { BngMetricSummary } from "@/types/bng";
import { PathwayFormStep } from "@/components/pathways/PathwayFormStep";
import { BngMetricPanel } from "./BngMetricPanel";

type Props = React.ComponentProps<typeof PathwayFormStep>;

/** The case's metric, then the step's own form fields (e.g. a decision). */
export function BngMetricStep(props: Props) {
  const [summary, setSummary] = useState<BngMetricSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bngService
      .getCaseMetric(props.state.case_id)
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [props.state.case_id]);

  return (
    <div className="space-y-5">
      <BngMetricPanel summary={summary} loading={loading} />
      <PathwayFormStep {...props} />
    </div>
  );
}
