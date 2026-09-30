"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { lookupQuery } from "@/queries/lookups";
import { useCreateIntermediary } from "@/queries/intermediaries";
import { buttonClass } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";

const FUNCTION_LOOKUP_KEY = "intermediary_function";

type FormState = {
  name: string;
  address: string;
  phone: string;
  email: string;
  contact_details: string;
  notes: string;
  function_ids: number[];
};

const initialForm: FormState = {
  name: "",
  address: "",
  phone: "",
  email: "",
  contact_details: "",
  notes: "",
  function_ids: [],
};

export function IntermediaryCreateForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const functions = useQuery(lookupQuery(FUNCTION_LOOKUP_KEY));
  const functionOptions = functions.data ?? [];
  const loadingLookups = functions.isPending;
  const createMutation = useCreateIntermediary();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setError] = useState("");
  const error = submitError || (functions.isError ? "Could not load intermediary functions." : "");

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleFunction(functionId: number) {
    setForm((current) => {
      const exists = current.function_ids.includes(functionId);

      return {
        ...current,
        function_ids: exists
          ? current.function_ids.filter((id) => id !== functionId)
          : [...current.function_ids, functionId],
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Intermediary name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Also refreshes the intermediaries list.
      await createMutation.mutateAsync({
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        contact_details: form.contact_details.trim() || undefined,
        notes: form.notes.trim() || undefined,
        function_ids: form.function_ids,
      });

      router.push("/intermediaries");
    } catch (err: any) {
      console.error("create intermediary failed", err);
      setError(
        err?.message ||
          err?.detail ||
          "Could not create intermediary. Please check the form and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex w-fit items-center rounded-full bg-accent-500/15 px-3 py-1 text-xs font-semibold text-accent-200 ring-1 ring-accent-400/25">
            Intermediary registry
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg">
            Create Intermediary
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-fg/60">
            Add a new intermediary and assign one or more intermediary functions.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-fg/10 bg-fg/[0.03] p-6"
      >
        {error && (
          <Alert tone="danger" className="mb-5">
            {error}
          </Alert>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name" required>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputClass}
              placeholder="Intermediary name"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={inputClass}
              placeholder="name@example.com"
            />
          </Field>

          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={inputClass}
              placeholder="+31..."
            />
          </Field>

          <Field label="Address">
            <input
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className={inputClass}
              placeholder="Address"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Contact details">
              <textarea
                value={form.contact_details}
                onChange={(e) => updateField("contact_details", e.target.value)}
                className={textareaClass}
                rows={3}
                placeholder="Main contact person, preferred contact method, etc."
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className={textareaClass}
                rows={4}
                placeholder="Internal notes"
              />
            </Field>
          </div>
        </div>

        <div className="mt-8 rounded-xl surface-card p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-fg">
              Intermediary functions
            </h2>
            <p className="mt-1 text-sm text-fg/60">
              Select all functions that apply to this intermediary.
            </p>
          </div>

          {loadingLookups ? (
            <p className="text-sm text-fg/60">Loading functions...</p>
          ) : functionOptions.length === 0 ? (
            <p className="text-sm text-fg/60">
              No intermediary functions available.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {functionOptions.map((option) => {
                const id = Number(option.value);
                const checked = form.function_ids.includes(id);

                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                      checked
                        ? "border-accent-400/40 bg-accent-400/10 text-accent-100"
                        : "border-fg/10 bg-fg/[0.03] text-fg/75 hover:bg-fg/[0.06]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFunction(id)}
                      className="h-4 w-4 rounded border-fg/20 bg-field accent-accent-400"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className={buttonClass("ghost")}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`disabled:cursor-not-allowed disabled:opacity-60 ${buttonClass("primary")}`}
          >
            {isSubmitting ? "Creating..." : "Create intermediary"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-fg/80">
        {label}
        {required && <span className="text-accent-300"> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass = fieldClass();

const textareaClass = fieldClass();