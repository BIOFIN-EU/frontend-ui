"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getLookupOptions, type LookupOption } from "@/services/lookups.service";
import { createIntermediary } from "@/services/intermediaries.service";

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
  const [functionOptions, setFunctionOptions] = useState<LookupOption[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFunctions() {
      try {
        setLoadingLookups(true);
        const options = await getLookupOptions(FUNCTION_LOOKUP_KEY);

        if (!cancelled) {
          setFunctionOptions(options);
        }
      } catch (err) {
        console.error("load intermediary functions failed", err);
        if (!cancelled) {
          setError("Could not load intermediary functions.");
        }
      } finally {
        if (!cancelled) {
          setLoadingLookups(false);
        }
      }
    }

    loadFunctions();

    return () => {
      cancelled = true;
    };
  }, []);

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
      await createIntermediary({
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        contact_details: form.contact_details.trim() || undefined,
        notes: form.notes.trim() || undefined,
        function_ids: form.function_ids,
      });

      router.push("/intermediaries");
      router.refresh();
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
          <div className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
            Intermediary master data
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Create Intermediary
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Add a new intermediary and assign one or more intermediary functions.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
        {error && (
          <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
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

        <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Intermediary functions
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Select all functions that apply to this intermediary.
            </p>
          </div>

          {loadingLookups ? (
            <p className="text-sm text-white/60">Loading functions...</p>
          ) : functionOptions.length === 0 ? (
            <p className="text-sm text-white/60">
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
                        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                        : "border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.06]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFunction(id)}
                      className="h-4 w-4 rounded border-white/20 bg-slate-950 accent-emerald-400"
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
            className="rounded-xl border border-white/10 px-5 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
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
      <span className="mb-2 block text-sm font-medium text-white/80">
        {label}
        {required && <span className="text-emerald-300"> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none placeholder:text-white/30 focus:border-emerald-400";

const textareaClass =
  "w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none placeholder:text-white/30 focus:border-emerald-400";