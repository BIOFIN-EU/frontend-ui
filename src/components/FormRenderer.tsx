"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import type { FieldSchema, StepSchema } from "@/types/forms";

function isVisible(field: FieldSchema, values: Record<string, any>) {
  if (!field.visible_if) return true;
  const r = field.visible_if;
  if (r.op === "equals") return values?.[r.field] === r.value;
  return true;
}

function Field({ field, register, values }: { field: FieldSchema; register: any; values: Record<string, any> }) {
  if (!isVisible(field, values)) return null;

  const common = {
    id: field.id,
    ...register(field.id, { required: !!field.required }),
  };

  switch (field.type) {
    case "text":
      return (
        <div style={{ marginBottom: 12 }}>
          <label htmlFor={field.id} style={{ display: "block", fontWeight: 600 }}>{field.label}</label>
          <input {...common} type="text" style={{ width: "100%", padding: 8 }} />
        </div>
      );
    case "number":
      return (
        <div style={{ marginBottom: 12 }}>
          <label htmlFor={field.id} style={{ display: "block", fontWeight: 600 }}>{field.label}</label>
          <input {...common} type="number" style={{ width: "100%", padding: 8 }} />
        </div>
      );
    case "select":
      return (
        <div style={{ marginBottom: 12 }}>
          <label htmlFor={field.id} style={{ display: "block", fontWeight: 600 }}>{field.label}</label>
          <select {...common} style={{ width: "100%", padding: 8 }}>
            <option value="">Select...</option>
            {(field.options || []).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      );
    case "radio":
      return (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600 }}>{field.label}</div>
          {(field.options || []).map((o) => (
            <label key={o.value} style={{ display: "block", marginTop: 6 }}>
              <input type="radio" value={o.value} {...register(field.id, { required: !!field.required })} />{" "}
              {o.label}
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" {...register(field.id, { required: !!field.required })} />
            <span style={{ fontWeight: 600 }}>{field.label}</span>
          </label>
        </div>
      );
    default:
      return null;
  }
}

export function FormRenderer({
  stepSchema,
  defaultValues,
  onSaveDraft,
  onNext,
  onPrev,
  isFirst,
  isLast,
}: {
  stepSchema: StepSchema;
  defaultValues: Record<string, any>;
  onSaveDraft: (values: Record<string, any>) => Promise<void>;
  onNext: (values: Record<string, any>) => Promise<void>;
  onPrev?: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const form = useForm({ defaultValues, mode: "onChange" });
  const values = form.watch();

  // Autosave with debounce
  React.useEffect(() => {
    const t = setTimeout(() => {
      // Only save if user has interacted (cheap heuristic)
      if (Object.keys(values || {}).length > 0) onSaveDraft(values);
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  return (
    <form
      onSubmit={form.handleSubmit(async (vals) => {
        await onNext(vals);
      })}
      style={{ display: "grid", gap: 8 }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{stepSchema.title}</h2>

      {stepSchema.fields.map((f) => (
        <Field key={f.id} field={f} register={form.register} values={values} />
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {!isFirst && (
          <button type="button" onClick={onPrev} style={{ padding: "8px 12px" }}>
            Back
          </button>
        )}
        <button type="submit" style={{ padding: "8px 12px" }}>
          {isLast ? "Finish" : "Next"}
        </button>
        <button
          type="button"
          onClick={form.handleSubmit(async (vals) => onSaveDraft(vals))}
          style={{ padding: "8px 12px", marginLeft: "auto" }}
        >
          Save draft
        </button>
      </div>
    </form>
  );
}
