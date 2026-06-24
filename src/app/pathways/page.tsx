"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { workflowService } from "@/services/workflow.service";

const pathways = [
  {
    code: "private_lending_v1",
    title: "Private Lending",
    subtitle: "Suitable for private lending opportunities",
    description:
      "Designed for projects seeking funding from private lenders. This pathway guides you through biodiversity assessment, financing requirements, and stakeholder engagement to prepare your project for lending discussions.",
    features: [
      "Project Definition",
      "Location Assessment & Vulnerability Index",
      "Loan Requirements",
      "Project Identifiers",
      "Intermediary Assignment",
    ],
  },
  {
    code: "use_case_2_v1",
    title: "Public / Private Financing",
    subtitle: "Suitable for public, private and blended finance",
    description:
      "Designed for projects seeking public funding, private investment, or blended finance. This pathway supports the development of investment-ready Nature-based Solution projects by combining biodiversity assessments, project planning, funding requirements, and supporting evidence.",
    features: [
      "Financing Model Selection",
      "Location Assessment & Vulnerability Index",
      "NbS Definition",
      "Funding Requirements",
      "Investment Rationale",
      "Supporting Documents",
    ],
  },
];

export default function PathwaysPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [creatingCode, setCreatingCode] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Project Pathways
        </h1>
        <p className="text-sm text-white/70">
          Loading available pathways...
        </p>
      </section>
    );
  }

  async function handleStartPathway(code: string) {
    try {
      setCreatingCode(code);
      setError("");

      const created = await workflowService.startWorkflow(code);

      router.push(`/pathways/${created.case_id}`);
    } catch (err) {
      console.error("create project failed", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create project");
      }
    } finally {
      setCreatingCode(null);
    }
  }

  return (
    <div className="space-y-10">
      <header className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Project Pathways
          </h1>

          <p className="max-w-3xl text-lg leading-8 text-white/70">
            Attract funding for Nature-based Solution projects by selecting a pathway.
          </p>

        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <div className="text-sm font-semibold tracking-wider text-emerald-300">
                STEP 1
              </div>

              <h3 className="mt-2 text-xl font-semibold text-white">
                Select a pathway
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Choose the pathway that best matches your project's financing
                and development approach.
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold tracking-wider text-emerald-300">
                STEP 2
              </div>

              <h3 className="mt-2 text-xl font-semibold text-white">
                Define your project
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Provide information about your intervention area, project
                objectives, stakeholders, and funding requirements.
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold tracking-wider text-emerald-300">
                STEP 3
              </div>

              <h3 className="mt-2 text-xl font-semibold text-white">
                Progress through the pathway
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Complete pathway activities, collaborate with partners, and
                develop your project over time.
              </p>
            </div>
          </div>
        </section>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-8 xl:grid-cols-2">
        {pathways.map((pathway) => (
          <div
            key={pathway.code}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-8 transition-all duration-300 hover:border-emerald-400/30 hover:shadow-[0_20px_80px_rgba(16,185,129,0.08)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex h-full flex-col">
              <div>
                <h2 className="text-3xl font-semibold text-white">
                  {pathway.title}
                </h2>

                <p className="mt-2 text-sm font-medium text-emerald-200">
                  {pathway.subtitle}
                </p>

                <p className="mt-6 text-base leading-7 text-white/70">
                  {pathway.description}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
                  Key Activities
                </h3>

                <div className="flex flex-wrap gap-2">
                  {pathway.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-white/80"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex-grow" />

              <div className="mt-8 border-t border-white/10 pt-6">
                <button
                  onClick={() => handleStartPathway(pathway.code)}
                  disabled={creatingCode === pathway.code}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-5 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/30 transition hover:bg-emerald-500/25 hover:ring-emerald-200/50 disabled:opacity-50"
                >
                  {creatingCode === pathway.code
                    ? "Creating project..."
                    : "Create project"}

                  {creatingCode !== pathway.code && (
                    <span aria-hidden="true">→</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}