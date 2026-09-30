"use client";

import { Suspense, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Layers, Leaf, Sprout, Store, Building2 } from "lucide-react";
import { useStartWorkflow } from "@/queries/workflow";
import { buttonClass } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";

const pathways = [
  {
    code: "private_lending_v1",
    group: "standard",
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
    group: "standard",
    title: "Public / Private Financing",
    subtitle: "Suitable for public, private and blended finance",
    description:
      "Designed for projects seeking public funding, private investment, or blended finance. This pathway supports the development of investment-ready Nature-based Solution projects by combining biodiversity assessments, project planning, funding requirements, and supporting evidence.",
    features: [
      "Financing Model Selection",
      "Location Assessment & Vulnerability Index",
      "Nature-based Solutions Definition",
      "Funding Requirements",
      "Investment Rationale",
      "Supporting Documents",
    ],
  },
  {
    code: "bng_habitat_bank_v1",
    group: "bng",
    title: "BNG Habitat Bank",
    subtitle: "Prototype · For landowners supplying biodiversity units",
    description:
      "Register land as a Biodiversity Net Gain habitat bank. Record the baseline and designed habitats, calculate the biodiversity units the site can sell, and secure it for 30 years with a management plan and legal agreement.",
    features: [
      "Site Registration & Boundary",
      "Feasibility & Additionality",
      "Baseline & Designed Habitats",
      "Biodiversity Metric (simplified)",
      "Management Plan & Unit Pricing",
      "Biodiversity Gain Site Register",
      "30-year Monitoring & Verification",
    ],
  },
  {
    code: "bng_development_v1",
    group: "bng",
    title: "BNG Development",
    subtitle: "Prototype · For developments delivering 10% net gain",
    description:
      "Show how a development achieves Biodiversity Net Gain. Compare habitats before and after, apply the mitigation hierarchy, and cover any shortfall with units allocated from registered habitat banks, through to planning approval.",
    features: [
      "Development Site & Baseline",
      "Post-development Metric",
      "Mitigation Hierarchy",
      "On-site or Off-site Decision",
      "Marketplace Unit Reservation",
      "Planning & Gain Plan Approval",
      "LPA & Ecologist Sign-off",
    ],
  },
];

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent-300/20 bg-accent-400/10 text-accent-200 shadow-inset-highlight">
      {children}
    </div>
  );
}

function SelectPathIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M7 9h10M7 14h5" />
      <path d="m15 13 3 3-3 3" />
    </svg>
  );
}

function DefineProjectIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v5h4M9 12h6M9 16h6" />
      <circle cx="6" cy="5" r="2" fill="#34d399" stroke="none" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 17 9 12l4 3 7-8" />
      <path d="M15 7h5v5" />
      <circle cx="4" cy="17" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="13" cy="15" r="2" />
    </svg>
  );
}

function PrivateLendingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10h18M5 10v8M9 10v8M15 10v8M19 10v8M3 19h18" />
      <path d="m12 3 9 5H3z" />
    </svg>
  );
}

function BlendedFinanceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="12" r="5" />
      <circle cx="16" cy="12" r="5" />
      <path d="M12 8.2a5 5 0 0 1 0 7.6" />
      <path d="M12 3v2M12 19v2" />
    </svg>
  );
}

const lucideIconClass = "h-7 w-7";

function PathwayIcon({ code }: { code: string }) {
  switch (code) {
    case "private_lending_v1":
      return <PrivateLendingIcon />;
    case "bng_habitat_bank_v1":
      return <Sprout className={lucideIconClass} strokeWidth={1.7} aria-hidden="true" />;
    case "bng_development_v1":
      return <Building2 className={lucideIconClass} strokeWidth={1.7} aria-hidden="true" />;
    default:
      return <BlendedFinanceIcon />;
  }
}

type PathwayGroup = "standard" | "bng";

const groupTabs: { key: PathwayGroup; label: string; icon: typeof Layers }[] = [
  { key: "standard", label: "NbS Financing", icon: Layers },
  { key: "bng", label: "Biodiversity Net Gain", icon: Leaf },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 10 4 4 8-9" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

const steps = [
  {
    number: "STEP 1",
    title: "Select a pathway",
    description:
      "Choose the pathway that best matches your project's financing and development approach.",
    icon: <SelectPathIcon />,
  },
  {
    number: "STEP 2",
    title: "Define your project",
    description:
      "Provide information about your intervention area, project objectives, stakeholders, and funding requirements.",
    icon: <DefineProjectIcon />,
  },
  {
    number: "STEP 3",
    title: "Progress through the pathway",
    description:
      "Complete pathway activities, collaborate with partners, and develop your project over time.",
    icon: <ProgressIcon />,
  },
];

export default function PathwaysPage() {
  return (
    <Suspense fallback={null}>
      <PathwaysPageInner />
    </Suspense>
  );
}

function PathwaysPageInner() {
  const router = useRouter();
  // ?tab=bng opens the BNG tab (kept in the URL so it survives a reload).
  const searchParams = useSearchParams();
  const group: PathwayGroup = searchParams.get("tab") === "bng" ? "bng" : "standard";

  function selectGroup(next: PathwayGroup) {
    router.replace(next === "bng" ? "/pathways?tab=bng" : "/pathways", { scroll: false });
  }

  const [creatingCode, setCreatingCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  // Also refreshes the project list, which gains the new project.
  const startWorkflow = useStartWorkflow();

  async function handleStartPathway(code: string) {
    try {
      setCreatingCode(code);
      setError("");

      const created = await startWorkflow.mutateAsync(code);

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
    <div className="space-y-8 pb-10">
      <header className="relative overflow-hidden rounded-3xl border border-fg/10 bg-deep px-6 py-6 shadow-panel-soft sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
        <PageHeader
          className="relative"
          eyebrow="Pathways"
          title="Project Pathways"
          subtitle="Attract funding for Nature-based Solution projects by selecting a pathway."
        />
      </header>

      <section className="relative overflow-hidden rounded-3xl border border-fg/10 bg-fg/[0.035] px-5 py-6 shadow-panel-soft sm:px-7 sm:py-7">

        <div className="relative grid gap-3 lg:grid-cols-3 lg:gap-5">
          {steps.map((step) => (
            <article key={step.number} className="flex gap-4 rounded-2xl border border-fg/[0.07] bg-shade/10 p-4 sm:p-5 lg:block lg:border-0 lg:bg-transparent lg:p-3">
              <IconFrame>{step.icon}</IconFrame>
              <div className="min-w-0 lg:mt-5">
                <div className="text-xs font-semibold tracking-[0.16em] text-accent-300">
                  {step.number}
                </div>
                <h3 className="mt-1.5 text-lg font-semibold text-fg">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-fg/65">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {error && (
        <Alert tone="danger" role="alert">
          {error}
        </Alert>
      )}

      <nav aria-label="Pathway groups" role="tablist" className="flex flex-wrap gap-2 border-b border-fg/10">
        {groupTabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.key === group;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectGroup(tab.key)}
              className={[
                "-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition",
                active ? "border-accent-400 text-fg" : "border-transparent text-fg/65 hover:text-fg",
              ].join(" ")}
            >
              <Icon className="h-4 w-4 text-accent-300" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {group === "bng" && (
        <div className="space-y-4">
          <p className="max-w-3xl text-sm leading-6 text-fg/65">
            Prototype pathways for Biodiversity Net Gain: habitat banks register land and sell biodiversity units,
            developments buy the units they need to reach a 10% net gain.
          </p>
          <Link
            href="/bng/marketplace"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent-400/20 bg-accent-500/[0.07] px-5 py-4 transition hover:border-accent-300/40 hover:bg-accent-500/[0.12]"
          >
            <span className="flex items-center gap-3 text-sm text-fg/80">
              <Store className="h-5 w-5 text-accent-300" aria-hidden="true" />
              Looking for biodiversity units? Compare registered habitat banks, their prices and what they cover.
            </span>
            <span className="text-sm font-semibold !text-accent-200">Browse the marketplace →</span>
          </Link>
        </div>
      )}

      <section className="grid items-stretch gap-5 xl:grid-cols-2">
        {pathways.filter((pathway) => pathway.group === group).map((pathway) => (
          <article key={pathway.code} className="group relative overflow-hidden rounded-3xl border border-fg/10 bg-fg/[0.035] shadow-panel-soft transition duration-300 hover:-translate-y-0.5 hover:border-accent-300/25 hover:shadow-card-hover">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-500/[0.045] via-transparent to-blue-500/[0.025] opacity-60" />

            <div className="relative flex h-full flex-col p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent-300/20 bg-accent-400/10 text-accent-200 shadow-inset-highlight">
                  <PathwayIcon code={pathway.code} />
                </div>

                <div className="min-w-0 pt-0.5">
                  <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                    {pathway.title}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-accent-200">
                    {pathway.subtitle}
                  </p>
                </div>
              </div>

              <p className="mt-6 text-sm leading-7 text-fg/70 sm:text-base">
                {pathway.description}
              </p>

              <div className="my-6 h-px bg-gradient-to-r from-fg/10 via-fg/[0.06] to-transparent" />

              <div>
                <h3 className="mb-4 text-eyebrow tracking-[0.16em]">
                  Key Activities
                </h3>

                <ul className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
                  {pathway.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm leading-5 text-fg/75">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent-300/20 bg-accent-400/10 text-accent-200">
                        <CheckIcon />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-7">
                <button onClick={() => handleStartPathway(pathway.code)} disabled={creatingCode === pathway.code} className={`w-full gap-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${buttonClass("primary")}`}>
                  {creatingCode === pathway.code
                    ? "Creating project..."
                    : "Create project"}

                  {creatingCode !== pathway.code && <ArrowIcon />}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}