"use client";

import { useCaseMetric } from "@/queries/bng";
import { PathwayFormStep } from "@/components/pathways/PathwayFormStep";
import { BngMetricPanel } from "./BngMetricPanel";

type Props = React.ComponentProps<typeof PathwayFormStep>;

/** The case's metric, then the step's own form fields (e.g. a decision). */
export function BngMetricStep(props: Props) {
  const { data: summary = null, isPending } = useCaseMetric(props.state.case_id);

  return (
    <div className="space-y-5">
      <BngMetricPanel summary={summary} loading={isPending} scope="workflow" />
      <PathwayFormStep {...props} />
    </div>
  );
}
