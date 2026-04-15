"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import type { WorkflowState } from "@/types/workflow";
import { FormRenderer } from "@/components/FormRenderer";
import RiskMap from "@/components/maps/RiskMap";
import { AdaptWorkflowStepToForm } from "@/components/workflow/WorkflowFormAdapter";

type Props = {
  state: WorkflowState;
  onStateUpdated: (state: WorkflowState) => void;
};

export function WorkflowMapStep({ state, onStateUpdated }: Props) {
  const step = state.step!;
  const [polygonWkt, setPolygonWkt] = useState("");
  const polygonWktRef = useRef("");
  const [error, setError] = useState("");

  const visibleFields = step.fields.filter((f) => f.name !== "polygon_wkt");

  const stepSchema = useMemo(
    () =>
      AdaptWorkflowStepToForm({
        ...step,
        fields: visibleFields,
      }),
    [step, visibleFields]
  );

  const defaultValues = useMemo(() => {
    const v: Record<string, any> = {};
    visibleFields.forEach((f) => {
      v[f.name] = f.default ?? "";
    });
    return v;
  }, [visibleFields]);

  useEffect(() => {
    polygonWktRef.current = polygonWkt;

    if (polygonWkt) {
      setError("");
    }
  }, [polygonWkt]);

  async function handleNext(values: Record<string, any>) {
    const currentPolygonWkt = polygonWktRef.current;

    console.log("polygonWkt before submit:", currentPolygonWkt);

    if (!currentPolygonWkt) {
      setError("Please draw a polygon on the map");
      return;
    }

    setError("");

    const updated = await workflowService.submitJsonStep(state.case_id, {
      ...values,
      polygon_wkt: currentPolygonWkt,
    });

    onStateUpdated(updated);
  }

  async function handleSaveDraft(_values: Record<string, any>) {
    return;
  }
  console.log("stepSchema", stepSchema);
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <RiskMap onPolygonWktChange={setPolygonWkt} />
      </div>

      <FormRenderer
        stepSchema={stepSchema}
        defaultValues={defaultValues}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        isFirst={false}
        isLast={!step.next}
      />

      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}