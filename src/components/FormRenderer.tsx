"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import type { FieldSchema, StepSchema } from "@/types/forms";
import { buttonClass } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { FieldHelp } from "@/components/ui/FieldHelp";
import { DatePicker } from "@/components/ui/DatePicker";
import { Badge } from "@/components/ui/Badge";

function isVisible(field: FieldSchema, values: Record<string, any>) {
  if (!field.visible_if) return true;
  const r = field.visible_if;
  if (r.op === "equals") return values?.[r.field] === r.value;
  return true;
}

export function RequirementBadge({ required }: { required: boolean }) {
  return required ? <Badge tone="warning">Required</Badge> : <Badge tone="muted">Optional</Badge>;
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

  const inputClass = fieldClass("step", { invalid: !!error });

  switch (field.type) {
    case "text": {
      const autoComplete =
        field.id === "region" ? "new-password" : "off";

      return (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <label htmlFor={field.id} className="text-sm font-semibold text-fg">
                {field.label}
              </label>
              <FieldHelp text={field.help} label={field.label} />
            </span>
            <RequirementBadge required={!!field.required} />
          </div>
          <input
            {...common}
            type="text"
            autoComplete={autoComplete}
            className={inputClass}
          />
          {error && <p className="text-sm text-danger-300">{error}</p>}
        </div>
      );
}

    case "number":
      return (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <label htmlFor={field.id} className="text-sm font-semibold text-fg">
                {field.label}
              </label>
              <FieldHelp text={field.help} label={field.label} />
            </span>
            <RequirementBadge required={!!field.required} />
          </div>
          <input
            {...common}
            type="number"
            className={inputClass}
            onWheel={(e) => e.currentTarget.blur()}
          />
          {error && <p className="text-sm text-danger-300">{error}</p>}
        </div>
      );

    case "date":
      // Stored as YYYY-MM-DD; the picker shows and accepts dd/mm/yyyy. The
      // hidden input keeps the field registered (and its required rule).
      return (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <label htmlFor={field.id} className="text-sm font-semibold text-fg">
                {field.label}
              </label>
              <FieldHelp text={field.help} label={field.label} />
            </span>
            <RequirementBadge required={!!field.required} />
          </div>
          <input type="hidden" {...register(field.id, { required: !!field.required })} />
          <DatePicker
            id={field.id}
            value={values?.[field.id] ?? ""}
            invalid={!!error}
            onChange={(iso) => setValue(field.id, iso, { shouldValidate: true, shouldDirty: true })}
          />
          {error && <p className="text-sm text-danger-300">{error}</p>}
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <label htmlFor={field.id} className="text-sm font-semibold text-fg">
                {field.label}
              </label>
              <FieldHelp text={field.help} label={field.label} />
            </span>
            <RequirementBadge required={!!field.required} />
          </div>
          <textarea {...common} rows={4} className={inputClass} />
          {error && <p className="text-sm text-danger-300">{error}</p>}
        </div>
      );

    case "content":
      return (
        <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-4">
          <h3 className="mb-2 text-sm font-semibold text-blue-100">
            {field.label}
          </h3>

          <div className="text-sm leading-relaxed text-fg/80 whitespace-pre-wrap">
            {field.content}
          </div>
        </div>
      );

    case "select": {
      const value = String(values?.[field.id] ?? "");
      const options = (field.options || []).map((o) => ({
        label: o.label,
        value: String(o.value),
        groupLabel: o.groupLabel,
      }));
      // A saved value that isn't offered (e.g. it no longer fits the field
      // above) is still shown, so it isn't silently replaced.
      if (value && !options.some((o) => o.value === value)) {
        const known = field.allOptions?.find((o) => String(o.value) === value);
        const settled = !field.optionsLoading && !field.disabled;
        options.push({
          label: `${known?.label ?? value}${settled ? " (no longer matches)" : ""}`,
          value,
          groupLabel: undefined,
        });
      }
      const placeholder = field.optionsLoading ? "Loading options..." : (field.placeholder ?? "Select...");

      return (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <label htmlFor={field.id} className="text-sm font-semibold text-fg">
                {field.label}
              </label>
              <FieldHelp
                text={field.help}
                label={field.label}
                options={field.describeOptions ? field.options : undefined}
              />
            </span>
            <RequirementBadge required={!!field.required} />
          </div>

          <input type="hidden" {...common} />

          <Select
            value={value}
            onChange={(nextValue) => {
              setValue(field.id, nextValue, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
            options={[{ label: placeholder, value: "" }, ...options]}
            placeholder={placeholder}
            disabled={field.disabled}
          />

          {error && <p className="text-sm text-danger-300">{error}</p>}
        </div>
      );
    }

    case "radio":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <div className="text-sm font-semibold text-fg">{field.label}</div>
              <FieldHelp text={field.help} label={field.label} />
            </span>
            <RequirementBadge required={!!field.required} />
          </div>
          {(field.options || []).map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-fg/80">
              <input
                type="radio"
                value={o.value}
                {...register(field.id, { required: !!field.required })}
              />
              {o.label}
            </label>
          ))}
          {error && <p className="text-sm text-danger-300">{error}</p>}
        </div>
      );

    case "checkbox":
      return (
        <div className="space-y-1">
          {/* The info button sits right after the label, as on every other
              field (outside the <label>, so clicking it doesn't tick the box);
              the badge stays on the right. */}
          <div className="flex items-start justify-between gap-3">
            <span className="flex min-w-0 items-start gap-1.5">
              <label className="flex min-w-0 items-start gap-2 text-fg">
                <input
                  type="checkbox"
                  className="mt-0.5 shrink-0"
                  {...register(field.id, { required: !!field.required })}
                />
                <span className="text-sm font-semibold">{field.label}</span>
              </label>
              <FieldHelp text={field.help} label={field.label} />
            </span>
            <span className="shrink-0">
              <RequirementBadge required={!!field.required} />
            </span>
          </div>
          {error && <p className="text-sm text-danger-300">{error}</p>}
        </div>
      );

    case "file":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <label htmlFor={field.id} className="text-sm font-semibold text-fg">
                {field.label}
              </label>
              <FieldHelp text={field.help} label={field.label} />
            </span>
            <RequirementBadge required={!!field.required} />
          </div>

          <div
            className={`rounded-2xl border bg-shade/20 p-4 ring-1 ring-fg/5 ${
              error ? "border-danger-400/60" : "border-fg/10"
            }`}
          >
            <input
              id={field.id}
              type="file"
              accept={field.accept}
              aria-describedby={field.hint ? `${field.id}-hint` : undefined}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setValue(field.id, file, { shouldValidate: true, shouldDirty: true });
              }}
              className="block w-full text-sm text-fg file:mr-4 file:rounded-xl file:border file:border-accent-300 file:bg-accent-400/15 file:px-4 file:py-2 file:font-semibold file:!text-fg hover:file:!text-on-solid hover:file:bg-accent-300"
            />
            {field.hint && (
              <p id={`${field.id}-hint`} className="mt-2 text-xs text-fg/50">
                {field.hint}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-danger-300">{error}</p>}
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
  onValuesChange,
  isFirst,
  isLast,
  fieldErrors = {},
  submitLabel,
}: {
  stepSchema: StepSchema;
  defaultValues: Record<string, any>;
  onSaveDraft: (
    values: Record<string, any>,
    opts?: { silent?: boolean }
  ) => Promise<void>;
  onNext: (values: Record<string, any>) => Promise<void>;
  onPrev?: () => void;
  // Called with the form's values whenever they change.
  onValuesChange?: (values: Record<string, any>) => void;
  isFirst: boolean;
  isLast: boolean;
  fieldErrors?: Record<string, string>;
  submitLabel?: string;
}) {
  const form = useForm({ defaultValues, mode: "onChange" });
  const values = form.watch();

  // Autosave-on-type: saves silently in the background (no confirmation
  // message) so unsaved progress isn't lost if the user navigates away.
  // Only an explicit click of the "Save draft" button below shows the
  // "Draft saved" confirmation.
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (Object.keys(values || {}).length > 0) {
        onSaveDraft(values, { silent: true });
      }
    }, 900);
    return () => clearTimeout(t);
  }, [JSON.stringify(values)]);

  // Dependent selects (filterBy): when the field above changes, clear the
  // value if it doesn't fit the new choice, once the new options are in.
  // Clearing a field this way can in turn clear the ones below it.
  const previousValues = React.useRef(values);
  const toCheck = React.useRef(new Set<string>());
  React.useEffect(() => {
    onValuesChange?.(values);

    const fields = stepSchema?.fields ?? [];
    fields.forEach((f) => {
      if (f.filterBy && String(values[f.filterBy] ?? "") !== String(previousValues.current[f.filterBy] ?? "")) {
        toCheck.current.add(f.id);
      }
    });
    previousValues.current = values;

    toCheck.current.forEach((id) => {
      const f = fields.find((field) => field.id === id);
      if (!f?.filterBy) return toCheck.current.delete(id);
      const ready = !f.optionsLoading && (f.optionsFor ?? "") === String(values[f.filterBy] ?? "");
      if (!ready) return;
      toCheck.current.delete(id);
      const value = String(values[id] ?? "");
      if (value && !(f.options ?? []).some((o) => String(o.value) === value)) {
        form.setValue(id, "", { shouldDirty: true, shouldValidate: true });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values), stepSchema]);

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
            className={buttonClass("ghost")}
          >
            Back
          </button>
        )}

        <button
          type="submit"
          className={buttonClass("primary")}
        >
          {submitLabel ?? (isLast ? "Finish" : "Next")}
        </button>

        <button
          type="button"
          onClick={form.handleSubmit(async (vals) => onSaveDraft(vals))}
          className={`ml-auto ${buttonClass("ghost")}`}
        >
          Save draft
        </button>
      </div>
    </form>
  );
}