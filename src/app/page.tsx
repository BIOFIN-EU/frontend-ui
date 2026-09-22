import Link from "next/link";
import { buttonBase, buttonPrimary, buttonSecondary } from "@/lib/ui";

const pillars = [
  {
    key: "classify",
    title: "Biodiversity Classification",
    subtitle: "for Sustainable Investments",
    example: "e.g. EU-Taxonomy",
  },
  {
    key: "assess",
    title: "Appraisal",
    subtitle: "Evaluating Risks and Ecosystem Services",
    example: "e.g. Risk Assessment / ML",
  },
  {
    key: "report",
    title: "Reporting and Regulatory",
    subtitle: "Compliance",
    example: "e.g. CSRD",
  },
];

const audiences = [
  {
    key: "fund",
    title: "Fund Nature-Based Solutions",
    text: "Explore biodiversity risk, opportunity, and evidence to support stronger investment decisions.",
    href: "/pathways",
    cta: "Explore funding pathways",
  },
  {
    key: "build",
    title: "Build Nature-Based Solutions",
    text: "Showcase your project, understand requirements, and position your solution for financing.",
    href: "/pathways",
    cta: "See how to get started",
  },
  {
    key: "support",
    title: "Get Support",
    text: "Use policy, reporting, and ecosystem intelligence to guide action across stakeholders.",
    href: "/support?audience=support",
    cta: "Discover support options",
  },
];

function TileGraphic({ type }: { type: string }) {
  if (type === "classify") {
    return (
      <svg viewBox="0 0 320 120" className="h-full w-full">
        <defs>
          <linearGradient id="classifyGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(52,211,153,0.85)" />
            <stop offset="100%" stopColor="rgba(16,185,129,0.25)" />
          </linearGradient>
        </defs>
        <rect x="26" y="68" width="52" height="24" rx="8" fill="rgba(255,255,255,0.08)" />
        <rect x="88" y="50" width="52" height="42" rx="8" fill="rgba(255,255,255,0.12)" />
        <rect x="150" y="34" width="52" height="58" rx="8" fill="url(#classifyGlow)" />
        <rect x="212" y="58" width="52" height="34" rx="8" fill="rgba(255,255,255,0.1)" />
        <path
          d="M52 68 C84 38, 122 28, 176 38 C212 44, 236 54, 252 58"
          fill="none"
          stroke="rgba(110,231,183,0.9)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="176" cy="38" r="5" fill="rgba(110,231,183,1)" />
      </svg>
    );
  }

  if (type === "assess") {
    return (
      <svg viewBox="0 0 320 120" className="h-full w-full">
        <defs>
          <radialGradient id="assessA">
            <stop offset="0%" stopColor="rgba(96,165,250,0.85)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0.12)" />
          </radialGradient>
          <radialGradient id="assessB">
            <stop offset="0%" stopColor="rgba(167,139,250,0.85)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0.12)" />
          </radialGradient>
          <radialGradient id="assessC">
            <stop offset="0%" stopColor="rgba(244,114,182,0.85)" />
            <stop offset="100%" stopColor="rgba(244,114,182,0.12)" />
          </radialGradient>
        </defs>
        <circle cx="84" cy="62" r="32" fill="url(#assessA)" />
        <circle cx="160" cy="48" r="24" fill="url(#assessB)" />
        <circle cx="224" cy="70" r="28" fill="url(#assessC)" />
        <path
          d="M84 62 L160 48 L224 70"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="2.5"
          strokeDasharray="5 5"
        />
        <circle cx="84" cy="62" r="4" fill="white" />
        <circle cx="160" cy="48" r="4" fill="white" />
        <circle cx="224" cy="70" r="4" fill="white" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 320 120" className="h-full w-full">
      <defs>
        <linearGradient id="reportBar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(244,114,182,0.35)" />
          <stop offset="100%" stopColor="rgba(244,114,182,0.9)" />
        </linearGradient>
      </defs>
      <rect x="42" y="58" width="26" height="34" rx="6" fill="url(#reportBar)" />
      <rect x="82" y="44" width="26" height="48" rx="6" fill="rgba(255,255,255,0.16)" />
      <rect x="122" y="30" width="26" height="62" rx="6" fill="rgba(255,255,255,0.22)" />
      <rect x="162" y="52" width="26" height="40" rx="6" fill="rgba(255,255,255,0.14)" />
      <rect x="202" y="22" width="26" height="70" rx="6" fill="url(#reportBar)" />
      <path
        d="M55 52 C92 38, 128 28, 175 42 C196 48, 214 36, 240 24"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="240" cy="24" r="5" fill="rgba(255,255,255,0.95)" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.12),transparent_30%)]" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <section className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="flex min-w-0 flex-col justify-center space-y-6 lg:pr-4">
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Invest in biodiversity with confidence.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                A platform that supports financers and providers to make efficient and transparent investments in Nature-based Solutions.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link
                href="/support"
                className={`${buttonBase} ${buttonPrimary}`}
              >
                Get support
              </Link>

              <Link
                href="https://biofin-project.eu/"
                className={`${buttonBase} ${buttonSecondary}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
              </Link>
            </div>
          </div>

          <div className="min-w-0 self-stretch rounded-3xl border border-white/10 bg-white/[0.05] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-5">
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                    Platform overview
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    Biodiversity finance workflow
                  </p>
                </div>
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300/20 to-cyan-300/10 ring-1 ring-white/10">
                  <span className="text-sm font-semibold text-white">NbS</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                    <p className="text-sm font-semibold text-emerald-100">Classify</p>
                    <p className="mt-1 text-xs leading-5 text-emerald-50/80">
                      Align projects with biodiversity frameworks.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                    <p className="text-sm font-semibold text-white">Assess</p>
                    <p className="mt-1 text-xs leading-5 text-white/75">
                      Evaluate biodiversity risk and ecosystem services.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                    <p className="text-sm font-semibold text-white">Communicate</p>
                    <p className="mt-1 text-xs leading-5 text-white/75">
                      Generate standardised reports and decision-ready outputs
                    </p>
                  </div>
                </div>
                <div
                    className="h-40 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
                  <svg
                      viewBox="0 0 500 140"
                      className="h-full w-full"
                      role="img"
                      aria-label="Project classification, biodiversity assessment and finance-ready reporting workflow"
                  >
                    <defs>
                      <linearGradient id="workflowLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#34d399"/>
                        <stop offset="52%" stopColor="#2dd4bf"/>
                        <stop offset="100%" stopColor="#60a5fa"/>
                      </linearGradient>

                      <radialGradient id="workflowGlow">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.14"/>
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0"/>
                      </radialGradient>

                      <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="5" result="blur"/>
                        <feMerge>
                          <feMergeNode in="blur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>

                      <marker
                          id="arrowHead"
                          viewBox="0 0 10 10"
                          refX="8"
                          refY="5"
                          markerWidth="5"
                          markerHeight="5"
                          orient="auto-start-reverse"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#47c9bd"/>
                      </marker>
                    </defs>

                    {/* Subtle background grid */}
                    <g stroke="rgba(255,255,255,0.035)" strokeWidth="1">
                      <path d="M0 35 H500 M0 70 H500 M0 105 H500"/>
                      <path d="M100 0 V140 M200 0 V140 M300 0 V140 M400 0 V140"/>
                    </g>

                    {/* Background glow */}
                    <ellipse
                        cx="250"
                        cy="70"
                        rx="230"
                        ry="85"
                        fill="url(#workflowGlow)"
                    />

                    {/* Connecting workflow */}
                    <path
                        d="M114 70 C145 42 177 42 208 70"
                        fill="none"
                        stroke="url(#workflowLine)"
                        strokeWidth="2"
                        strokeOpacity="0.8"
                        markerEnd="url(#arrowHead)"
                    />
                    <path
                        d="M292 70 C323 42 355 42 386 70"
                        fill="none"
                        stroke="url(#workflowLine)"
                        strokeWidth="2"
                        strokeOpacity="0.8"
                        markerEnd="url(#arrowHead)"
                    />

                    {/* Stage 1: classify project */}
                    <g transform="translate(75 70)">
                      <circle
                          r="39"
                          fill="#0d3232"
                          stroke="#167466"
                          strokeWidth="1.5"
                      />
                      <circle r="31" fill="none" stroke="rgba(52,211,153,0.12)"/>

                      {/* Land layers */}
                      <path
                          d="M-18 9 L0 18 L18 9 L0 0 Z"
                          fill="none"
                          stroke="#7ee2c1"
                          strokeWidth="2"
                          strokeLinejoin="round"
                      />
                      <path
                          d="M-18 1 L0 10 L18 1"
                          fill="none"
                          stroke="#7ee2c1"
                          strokeWidth="2"
                          strokeLinecap="round"
                      />

                      {/* Leaf */}
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

                    {/* Stage 2: biodiversity assessment */}
                    <g transform="translate(250 70)">
                      <circle
                          r="39"
                          fill="#112b35"
                          stroke="#278f87"
                          strokeWidth="1.5"
                      />
                      <circle r="31" fill="none" stroke="rgba(45,212,191,0.12)"/>

                      {/* Magnifying glass */}
                      <circle
                          cx="-4"
                          cy="-5"
                          r="13"
                          fill="none"
                          stroke="#8be4d5"
                          strokeWidth="2.5"
                      />
                      <path
                          d="M6 5 L17 16"
                          stroke="#8be4d5"
                          strokeWidth="3"
                          strokeLinecap="round"
                      />

                      {/* Biodiversity leaf inside lens */}
                      <path
                          d="M-8 1 C-9 -9 -2 -14 6 -13 C7 -5 2 1 -8 1 Z"
                          fill="#34d399"
                          fillOpacity="0.85"
                      />
                      <path
                          d="M-6 -1 L3 -10"
                          stroke="#d1fae5"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                      />
                    </g>

                    {/* Stage 3: finance-ready report */}
                    <g transform="translate(425 70)">
                      <circle
                          r="39"
                          fill="#14283e"
                          stroke="#397fc0"
                          strokeWidth="1.5"
                      />
                      <circle r="31" fill="none" stroke="rgba(96,165,250,0.13)"/>

                      {/* Report */}
                      <path
                          d="M-15 -20 H8 L18 -10 V20 H-15 Z"
                          fill="none"
                          stroke="#93c5fd"
                          strokeWidth="2"
                          strokeLinejoin="round"
                      />
                      <path
                          d="M8 -20 V-10 H18"
                          fill="none"
                          stroke="#93c5fd"
                          strokeWidth="2"
                          strokeLinejoin="round"
                      />

                      {/* Successful output */}
                      <path
                          d="M-7 8 L-1 13 L10 1"
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#softGlow)"
                      />
                      <path
                          d="M-7 -8 H6 M-7 -2 H10"
                          stroke="#93c5fd"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeOpacity="0.7"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Optional pillar section can be re-enabled later if needed */}

        <section className="mt-10 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-stretch">
            <div className="flex min-w-0 flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/65">
                Call to action
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Are you looking to fund, showcase, or support Nature-Based Solutions?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                Whether you are an investor, provider, policymaker, or enabling intermediary,
                this platform helps you understand biodiversity value,
                assess environmental risk, and move toward trusted action.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/support"
                  className={`${buttonBase} ${buttonPrimary}`}
                >
                  Contact support
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {audiences.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5 transition duration-200 hover:border-emerald-300/30 hover:bg-black/30"
                >
                  <div>
                    <p className="text-base font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/75">
                      {item.text}
                    </p>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-emerald-200 transition group-hover:text-emerald-100">
                    {item.cta} →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}