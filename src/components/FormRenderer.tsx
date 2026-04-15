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

function Field({
  field,
  register,
  setValue,
  values,
}: {
  field: FieldSchema;
  register: any;
  setValue: any;
  values: Record<string, any>;
}) {
  if (!isVisible(field, values)) return null;

  const common = {
    id: field.id,
    ...register(field.id, { required: !!field.required }),
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white ring-1 ring-white/5";

  switch (field.type) {
    case "text":
      return (
        <div className="space-y-1">
          <label htmlFor={field.id} className="text-sm font-semibold text-white">
            {field.label}
          </label>
          <input {...common} type="text" className={inputClass} />
        </div>
      );

    case "number":
      return (
        <div className="space-y-1">
          <label htmlFor={field.id} className="text-sm font-semibold text-white">
            {field.label}
          </label>
          <input {...common} type="number" className={inputClass} />
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-1">
          <label htmlFor={field.id} className="text-sm font-semibold text-white">
            {field.label}
          </label>
          <textarea {...common} rows={4} className={inputClass} />
        </div>
      );

    case "select":
      return (
        <div className="space-y-1">
          <label htmlFor={field.id} className="text-sm font-semibold text-white">
            {field.label}
          </label>
          <select {...common} className={inputClass}>
            <option value="">Select...</option>
            {(field.options || []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "radio":
      return (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-white">
            {field.label}
          </div>
          {(field.options || []).map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-white/80">
              <input
                type="radio"
                value={o.value}
                {...register(field.id, { required: !!field.required })}
              />
              {o.label}
            </label>
          ))}
        </div>
      );

    case "checkbox":
      return (
        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            {...register(field.id, { required: !!field.required })}
          />
          <span className="text-sm font-semibold">{field.label}</span>
        </label>
      );

    case "file":
      return (
        <div className="space-y-1">
          <label className="text-sm font-semibold text-white">
            {field.label}
          </label>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setValue(field.id, file);
            }}
            className="text-white"
          />
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

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (Object.keys(values || {}).length > 0) onSaveDraft(values);
    }, 900);
    return () => clearTimeout(t);
  }, [JSON.stringify(values)]);

  return (
    <form
      onSubmit={form.handleSubmit(async (vals) => {
        await onNext(vals);
      })}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-white">
          {stepSchema?.title ?? "Step"}
      </h2>

        {(stepSchema?.fields ?? []).map((f) => (
        <Field
          key={f.id}
          field={f}
          register={form.register}
          setValue={form.setValue}
          values={values}
        />
      ))}

      <div className="flex gap-2 pt-2">
        {!isFirst && (
          <button
            type="button"
            onClick={onPrev}
            className="rounded-xl bg-white/8 px-4 py-2 text-sm text-white"
          >
            Back
          </button>
        )}

        <button
          type="submit"
          className="rounded-xl bg-emerald-400/20 px-4 py-2 text-sm font-semibold text-emerald-200"
        >
          {isLast ? "Finish" : "Next"}
        </button>

        <button
          type="button"
          onClick={form.handleSubmit(async (vals) => onSaveDraft(vals))}
          className="ml-auto rounded-xl bg-white/8 px-4 py-2 text-sm text-white"
        >
          Save draft
        </button>
      </div>
    </form>
  );
}