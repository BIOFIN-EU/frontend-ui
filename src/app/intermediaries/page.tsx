"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  listIntermediaries,
  type Intermediary,
} from "@/services/intermediaries.service";

export default function IntermediariesPage() {
  const [intermediaries, setIntermediaries] = useState<Intermediary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadIntermediaries() {
      try {
        setLoading(true);
        const data = await listIntermediaries();

        if (!cancelled) {
          setIntermediaries(data);
          setError("");
        }
      } catch (err: any) {
        console.error("load intermediaries failed", err);

        if (!cancelled) {
          setError(err?.message || "Could not load intermediaries.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadIntermediaries();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
            Intermediary master data
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Intermediaries
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            View registered intermediaries and the functions assigned to them.
          </p>
        </div>

        <Link
          href="/intermediaries/new"
          className="rounded-xl bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
        >
          Register intermediary
        </Link>
      </header>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-white/70">
          Loading intermediaries...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && intermediaries.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <h2 className="text-xl font-semibold text-white">
            No intermediaries yet
          </h2>

          <p className="mt-2 text-sm text-white/60">
            Register your first intermediary to start assigning functions.
          </p>

          <Link
            href="/intermediaries/new"
            className="mt-5 inline-flex rounded-xl bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
          >
            Register intermediary
          </Link>
        </div>
      )}

      {!loading && !error && intermediaries.length > 0 && (
        <div className="grid gap-4">
          {intermediaries.map((intermediary) => {
            const groupedFunctions = intermediary.functions.reduce<
              Record<string, typeof intermediary.functions>
            >((groups, fn) => {
              const category = fn.intermediary_function_category || "Other";

              if (!groups[category]) {
                groups[category] = [];
              }

              groups[category].push(fn);

              return groups;
            }, {});

            return (
              <article
                key={intermediary.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {intermediary.name}
                    </h2>

                    <div className="mt-3 grid gap-2 text-sm text-white/60 sm:grid-cols-2">
                      {intermediary.email && (
                        <p>
                          <span className="text-white/40">Email:</span>{" "}
                          {intermediary.email}
                        </p>
                      )}

                      {intermediary.phone && (
                        <p>
                          <span className="text-white/40">Phone:</span>{" "}
                          {intermediary.phone}
                        </p>
                      )}

                      {intermediary.address && (
                        <p className="sm:col-span-2">
                          <span className="text-white/40">Address:</span>{" "}
                          {intermediary.address}
                        </p>
                      )}
                    </div>

                    {intermediary.contact_details && (
                      <p className="mt-4 text-sm leading-6 text-white/60">
                        <span className="text-white/40">Contact:</span>{" "}
                        {intermediary.contact_details}
                      </p>
                    )}

                    {intermediary.notes && (
                      <p className="mt-3 text-sm leading-6 text-white/60">
                        <span className="text-white/40">Notes:</span>{" "}
                        {intermediary.notes}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 lg:max-w-md">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                      Functions
                    </p>

                    {intermediary.functions.length === 0 ? (
                      <p className="text-sm text-white/50">
                        No functions assigned.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(groupedFunctions).map(
                          ([category, functions]) => (
                            <div key={category}>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                                {category}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {functions.map((fn) => (
                                  <span
                                    key={fn.id}
                                    className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100"
                                  >
                                    {fn.intermediary_function_name ||
                                      `Function #${fn.intermediary_function_id}`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}