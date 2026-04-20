"use client";

import { useEffect, useMemo, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import { getLookupOptions, type LookupOption } from "@/services/lookups.service";
// import type { WorkflowState } from "@/types/workflow";
import { FormRenderer } from "@/components/FormRenderer";
import RiskMap from "@/components/maps/RiskMap";

type Props = {
  state: WorkflowState;
  onStateUpdated: (state: WorkflowState) => void;
};

export function WorkflowMapStep({ state, onStateUpdated }: Props) {
  const step = state.step!;
  const [polygonWkt, setPolygonWkt] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lookupOptions, setLookupOptions] = useState<Record<string, LookupOption[]>>({});

  useEffect(() => {
    const field = step.fields.find((f) => f.name === "polygon_wkt");
    setPolygonWkt((current) => current || field?.default || "");
  }, [step]);

  const nonPolygonFields = useMemo(
    () => step.fields.filter((f) => f.name !== "polygon_wkt"),
    [step]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      const selectFields = nonPolygonFields.filter(
        (f) => f.type === "select" && f.options_source
      );

      if (selectFields.length === 0) {
        setLookupOptions({});
        return;
      }

      const results = await Promise.all(
        selectFields.map(async (f) => {
          try {
            const options = await getLookupOptions(f.options_source!);
            return [f.name, options] as const;
          } catch {
            return [f.name, []] as const;
          }
        })
      );

      if (!cancelled) {
        setLookupOptions(Object.fromEntries(results));
      }
    }

    loadLookups();

    return () => {
      cancelled = true;
    };
  }, [nonPolygonFields]);

  const stepSchema = useMemo(
    () => ({
      title: step.title,
      fields: nonPolygonFields.map((f) => ({
        id: f.name,
        label: f.display_name,
        type: f.type as any,
        required: !!f.required,
        options:
          f.type === "select" && f.options_source
            ? (lookupOptions[f.name] ?? [])
            : (Array.isArray(f.options) ? f.options : []),
      })),
    }),
    [step, nonPolygonFields, lookupOptions]
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
      const payload = {
        ...values,
        polygon_wkt: finalPolygonWkt,
      };

      nonPolygonFields.forEach((f) => {
        const value = payload[f.name];

        if (value === "" || value == null) {
          payload[f.name] = null;
          return;
        }

        if (f.type === "number") {
          payload[f.name] = Number(value);
          return;
        }

        if (f.type === "select" && f.name.endsWith("_id")) {
          payload[f.name] = Number(value);
          return;
        }
      });

      const updated = await workflowService.submitJsonStep(state.case_id, payload);
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