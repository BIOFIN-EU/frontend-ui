"use client";

import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { PageBackdrop } from "@/components/PageBackdrop";
import { photoCredits } from "@/lib/photo-credits";
import forest from "../../../../public/images/forest-dieny-portinanni.jpg";

import { useIntermediaries } from "@/queries/intermediaries";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";

export default function IntermediariesPage() {
  const { data: intermediaries = [], isPending: loading, error: loadError } = useIntermediaries();
  const error = loadError ? loadError.message || "Could not load intermediaries." : "";

  return (
    <div className="relative isolate space-y-8">
      <PageBackdrop
        image={forest}
        credit={photoCredits.forest}
        heightClassName="h-[460px] lg:h-[520px]"
        objectPositionClassName="object-[50%_35%]"
      />

      <PageHeader
        className="pt-3"
        title="Intermediaries"
        subtitle="View registered intermediaries and the functions assigned to them."
        actions={
          <Link href="/intermediaries/new" className={buttonClass("primary")}>
            Register intermediary
          </Link>
        }
      />

      {loading && (
        <div className="rounded-2xl border border-fg/10 bg-scrim/80 backdrop-blur-md p-6 text-fg/75">
          Loading intermediaries...
        </div>
      )}

      {!loading && error && (
        <Alert tone="danger">
          {error}
        </Alert>
      )}

      {!loading && !error && intermediaries.length === 0 && (
        <div className="rounded-2xl border border-fg/10 bg-scrim/80 backdrop-blur-md p-8 text-center">
          <h2 className="text-xl font-semibold text-fg">
            No intermediaries yet
          </h2>

          <p className="mt-2 text-sm text-fg/75">
            Register as an Intermediary and specify your credentials and support services.
          </p>

          <Link
            href="/intermediaries/new"
            className={`mt-5 ${buttonClass("primary")}`}
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
                className="rounded-2xl border border-fg/10 bg-scrim/80 backdrop-blur-md p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-fg">
                      {intermediary.name}
                    </h2>

                    <div className="mt-3 grid gap-2 text-sm text-fg/75 sm:grid-cols-2">
                      {intermediary.email && (
                        <p>
                          <span className="text-fg/60">Email:</span>{" "}
                          {intermediary.email}
                        </p>
                      )}

                      {intermediary.phone && (
                        <p>
                          <span className="text-fg/60">Phone:</span>{" "}
                          {intermediary.phone}
                        </p>
                      )}

                      {intermediary.address && (
                        <p className="sm:col-span-2">
                          <span className="text-fg/60">Address:</span>{" "}
                          {intermediary.address}
                        </p>
                      )}
                    </div>

                    {intermediary.contact_details && (
                      <p className="mt-4 text-sm leading-6 text-fg/75">
                        <span className="text-fg/60">Contact:</span>{" "}
                        {intermediary.contact_details}
                      </p>
                    )}

                    {intermediary.notes && (
                      <p className="mt-3 text-sm leading-6 text-fg/75">
                        <span className="text-fg/60">Notes:</span>{" "}
                        {intermediary.notes}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 lg:max-w-md">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg/60">
                      Functions
                    </p>

                    {intermediary.functions.length === 0 ? (
                      <p className="text-sm text-fg/65">
                        No functions assigned.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(groupedFunctions).map(
                          ([category, functions]) => (
                            <div key={category}>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-200">
                                {category}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {functions.map((fn) => (
                                  <span
                                    key={fn.id}
                                    className="rounded-full border border-accent-400/25 bg-accent-400/10 px-3 py-1 text-xs font-medium text-accent-100"
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