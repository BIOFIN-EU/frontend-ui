"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import type { FieldSchema, StepSchema } from "@/types/forms";
import { Select } from "@/components/ui/Select";

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
  error,
}: {
  field: FieldSchema;
  register: any;
  setValue: any;
  values: Record<string, any>;
  error?: string;
}) {
  if (!isVisible(field, values)) return null;

  const common = {
    id: field.id,
    ...register(field.id, { required: !!field.required }),
  };

  const inputClass = `w-full rounded-xl border bg-black/20 px-3 py-2 text-white ring-1 ring-white/5 ${
    error ? "border-red-400/60" : "border-white/10"
  }`;

  switch (field.type) {
    case "text": {
      const autoComplete =
        field.id === "region" ? "new-password" : "off";

      return (
        <div className="space-y-1">
          <label htmlFor={field.id} className="text-sm font-semibold text-white">
            {field.label}
          </label>
          <input
            {...common}
            type="text"
            autoComplete={autoComplete}
            className={inputClass}
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      );
}

    case "number":
      return (
        <div className="space-y-1">
          <label htmlFor={field.id} className="text-sm font-semibold text-white">
            {field.label}
          </label>
          <input {...common} type="number" className={inputClass} />
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-1">
          <label htmlFor={field.id} className="text-sm font-semibold text-white">
            {field.label}
          </label>
          <textarea {...common} rows={4} className={inputClass} />
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      );

    case "content":
      return (
        <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-4">
          <h3 className="mb-2 text-sm font-semibold text-blue-100">
            {field.label}
          </h3>

          <div className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
            {field.content}
          </div>
        </div>
      );

    case "select":
      return (
        <div className="space-y-1">
          <label htmlFor={field.id} className="text-sm font-semibold text-white">
            {field.label}
          </label>

          <input type="hidden" {...common} />

          <Select
            value={String(values?.[field.id] ?? "")}
            onChange={(nextValue) => {
              setValue(field.id, nextValue, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
            options={[
              { label: "Select...", value: "" },
              ...((field.options || []).map((o) => ({
                label: o.label,
                value: String(o.value),
              }))),
            ]}
          />

          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      );

    case "radio":
      return (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-white">{field.label}</div>
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
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      );

    case "checkbox":
      return (
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              {...register(field.id, { required: !!field.required })}
            />
            <span className="text-sm font-semibold">{field.label}</span>
          </label>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      );

    case "file":
      return (
        <div className="space-y-2">
          <label htmlFor={field.id} className="text-sm font-semibold text-white">
            {field.label}
          </label>

          <div
            className={`rounded-2xl border bg-black/20 p-4 ring-1 ring-white/5 ${
              error ? "border-red-400/60" : "border-white/10"
            }`}
          >
            <input
              id={field.id}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setValue(field.id, file, { shouldValidate: true, shouldDirty: true });
              }}
              className="block w-full text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-400/15 file:px-4 file:py-2 file:font-semibold file:text-emerald-100 hover:file:bg-emerald-400/20"
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}
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
  fieldErrors = {},
}: {
  stepSchema: StepSchema;
  defaultValues: Record<string, any>;
  onSaveDraft: (values: Record<string, any>) => Promise<void>;
  onNext: (values: Record<string, any>) => Promise<void>;
  onPrev?: () => void;
  isFirst: boolean;
  isLast: boolean;
  fieldErrors?: Record<string, string>;
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
      {(stepSchema?.fields ?? []).map((f) => (
        <Field
          key={f.id}
          field={f}
          register={form.register}
          setValue={form.setValue}
          values={values}
          error={fieldErrors[f.id]}
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