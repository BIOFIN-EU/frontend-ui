"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const field = step.fields.find((f) => f.name === "polygon_wkt");
    setPolygonWkt((current) => current || field?.default || "");
  }, [step]);

  const nonPolygonFields = useMemo(
    () => step.fields.filter((f) => f.name !== "polygon_wkt"),
    [step]
  );

  const stepSchema = useMemo(
    () =>
      AdaptWorkflowStepToForm({
        ...step,
        fields: nonPolygonFields,
      }),
    [step, nonPolygonFields]
  );

  const defaultValues = useMemo(() => {
    const values: Record<string, any> = {};

    step.fields.forEach((f) => {
      if (f.name === "polygon_wkt") {
        values[f.name] = polygonWkt || f.default || "";
      } else {
        values[f.name] = f.default ?? "";
      }
    });

    return values;
  }, [step, polygonWkt]);

  useEffect(() => {
    if (polygonWkt.trim()) {
      setError("");
    }
  }, [polygonWkt]);

  async function handleNext(values: Record<string, any>) {
  const finalPolygonWkt = polygonWkt || values.polygon_wkt || "";

  if (!finalPolygonWkt.trim()) {
    setError("Please draw a polygon on the map or enter polygon WKT");
    return;
  }

  setError("");
  setFieldErrors({});

  try {
    const updated = await workflowService.submitJsonStep(state.case_id, {
      ...values,
      polygon_wkt: finalPolygonWkt,
    });

    onStateUpdated(updated.state ?? updated);
  } catch (err: any) {
    setFieldErrors(err.fieldErrors || {});
  }
}

  async function handleSaveDraft(_values: Record<string, any>) {
    return;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <RiskMap
          polygonWkt={polygonWkt}
          onPolygonWktChange={setPolygonWkt}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Polygon WKT
        </label>
        <textarea
          value={polygonWkt}
          onChange={(e) => setPolygonWkt(e.target.value)}
          className="min-h-32 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white"
          placeholder="Draw on the map or paste/edit polygon WKT here"
        />
      </div>

      <FormRenderer
        stepSchema={stepSchema}
        defaultValues={defaultValues}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        isFirst={false}
        isLast={!step.next}
        fieldErrors={fieldErrors}
      />

      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}