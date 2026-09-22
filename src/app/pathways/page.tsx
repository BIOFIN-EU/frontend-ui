"use client";

import { useState, type ReactNode } from "react";
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
      "Nature-based Solutions Definition",
      "Funding Requirements",
      "Investment Rationale",
      "Supporting Documents",
    ],
  },
];

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
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
    <div className="space-y-8 pb-10">
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#07101f] px-6 py-8 shadow-[0_22px_70px_rgba(0,0,0,0.28)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(16,185,129,0.12),transparent_34%),radial-gradient(circle_at_88%_70%,rgba(59,130,246,0.08),transparent_34%)]" />
        <div className="relative space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Project Pathways
          </h1>
          <p className="max-w-3xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
            Attract funding for Nature-based Solution projects by selecting a pathway.
          </p>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] px-5 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.2)] sm:px-7 sm:py-7">

        <div className="relative grid gap-3 lg:grid-cols-3 lg:gap-5">
          {steps.map((step) => (
function SupportIllustration() {
  return (
      <svg viewBox="0 0 520 260" className="h-full w-full" role="img"
           aria-label="Nature-based solutions support network">
        <defs>
          <linearGradient id="supportLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#34d399"/>
            <stop offset="55%" stopColor="#2dd4bf"/>
            <stop offset="100%" stopColor="#60a5fa"/>
          </linearGradient>
          <radialGradient id="supportGlow">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#34d399" stopOpacity="0"/>
          </radialGradient>
        </defs>

        <g stroke="rgba(255,255,255,0.035)" strokeWidth="1">
          <path d="M0 52H520 M0 104H520 M0 156H520 M0 208H520"/>
          <path d="M104 0V260 M208 0V260 M312 0V260 M416 0V260"/>
        </g>
        <ellipse cx="260" cy="130" rx="230" ry="120" fill="url(#supportGlow)"/>
        <path d="M82 178 C132 134 171 118 222 125M298 125 C350 116 388 133 438 178M260 91V38" fill="none"
              stroke="url(#supportLine)" strokeWidth="2" strokeOpacity="0.7"/>

        <circle cx="260" cy="130" r="48" fill="#0d3232" stroke="#34d399" strokeWidth="1.5"/>
        <circle cx="260" cy="130" r="37" fill="none" stroke="rgba(52,211,153,0.14)"/>
        <g transform="translate(260 130) scale(1.6)">
          <path
              d="M1 -19 C12 -19 18 -12 16 -2 C6 0 0 -7 1 -19 Z"
              fill="#34d399"
              fillOpacity="0.75"
          />
          <path
              d="M3 -16 L13 -5"
              stroke="#d1fae5"
              strokeWidth="1.5"
              strokeLinecap="round"
          />
        </g>

        <g transform="translate(260 30)">
          <circle r="18" fill="#14283e" stroke="#60a5fa" strokeWidth="1.5"/>
          <path d="M-7 2 -2 7 8-5" fill="none" stroke="#93c5fd" strokeWidth="2.2" strokeLinecap="round"
                strokeLinejoin="round"/>
        </g>
        <g transform="translate(72 186)">
          <circle r="24" fill="#102f30" stroke="#2dd4bf" strokeWidth="1.5"/>
          <circle cx="-5" cy="-5" r="6" fill="none" stroke="#99f6e4" strokeWidth="1.7"/>
          <circle cx="8" cy="2" r="5" fill="none" stroke="#99f6e4" strokeWidth="1.7"/>
          <path d="M-16 13c1-7 6-11 11-11s10 4 11 11M4 13c1-5 4-8 8-8 3 0 6 2 8 6" fill="none" stroke="#99f6e4"
                strokeWidth="1.7" strokeLinecap="round"/>
        </g>
        <g transform="translate(448 186)">
          <circle r="24" fill="#14283e" stroke="#60a5fa" strokeWidth="1.5"/>
          <path d="M-10-13H6l8 8v18h-24ZM6-13v8h8" fill="none" stroke="#93c5fd" strokeWidth="1.7"
                strokeLinejoin="round"/>
          <path d="M-5 5h11M-5 10h8" stroke="#34d399" strokeWidth="1.7" strokeLinecap="round"/>
        </g>
      </svg>
  );
}
            <article key={step.number} className="flex gap-4 rounded-2xl border border-white/[0.07] bg-black/10 p-4 sm:p-5 lg:block lg:border-0 lg:bg-transparent lg:p-3">
              <IconFrame>{step.icon}</IconFrame>
              <div className="min-w-0 lg:mt-5">
                <div className="text-xs font-semibold tracking-[0.16em] text-emerald-300">
                  {step.number}
                </div>
                <h3 className="mt-1.5 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid items-stretch gap-5 xl:grid-cols-2">
        {pathways.map((pathway, index) => (
          <article key={pathway.code} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/25 hover:shadow-[0_24px_70px_rgba(16,185,129,0.07)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.045] via-transparent to-blue-500/[0.025] opacity-60" />

            <div className="relative flex h-full flex-col p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
                  {index === 0 ? <PrivateLendingIcon /> : <BlendedFinanceIcon />}
                </div>

                <div className="min-w-0 pt-0.5">
                  <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {pathway.title}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-emerald-200">
                    {pathway.subtitle}
                  </p>
                </div>
              </div>

              <p className="mt-6 text-sm leading-7 text-white/70 sm:text-base">
                {pathway.description}
              </p>

              <div className="my-6 h-px bg-gradient-to-r from-white/10 via-white/[0.06] to-transparent" />

              <div>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                  Key Activities
                </h3>

                <ul className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
                  {pathway.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm leading-5 text-white/75">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-400/10 text-emerald-200">
                        <CheckIcon />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-7">
                <button onClick={() => handleStartPathway(pathway.code)} disabled={creatingCode === pathway.code} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/25 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:border-emerald-200/40 hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
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