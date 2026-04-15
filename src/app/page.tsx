import Link from "next/link";

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
    href: "/support?audience=funder",
    cta: "Explore funding pathways",
  },
  {
    key: "build",
    title: "Build Nature-Based Solutions",
    text: "Showcase your project, understand requirements, and position your solution for financing.",
    href: "/support?audience=builder",
    cta: "See how to get started",
  },
  {
    key: "support",
    title: "Support Nature-Based Solutions",
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
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.12),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl space-y-10 px-6 py-10 sm:px-8 lg:px-10">
        <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
              Nature-based finance platform
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Finance, assess, and report on biodiversity with confidence.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                A modern platform for biodiversity classification, risk appraisal,
                and regulatory reporting that helps investors, providers, and
                policy stakeholders work with Nature-Based Solutions more effectively.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/support"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/30 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:bg-emerald-400/20 hover:ring-emerald-200/40 active:translate-y-[1px]"
              >
                Get support
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-xl bg-white/8 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/12 hover:ring-white/25 active:translate-y-[1px]"
              >
                Learn more
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                    Platform overview
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    Biodiversity finance workflow
                  </p>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300/20 to-cyan-300/10 ring-1 ring-white/10">
                  <span className="text-sm font-semibold text-white">NBS</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                    <p className="text-sm font-semibold text-emerald-100">Classify</p>
                    <p className="mt-1 text-xs leading-5 text-emerald-50/75">
                      Align projects with biodiversity frameworks.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm font-semibold text-white">Assess</p>
                    <p className="mt-1 text-xs leading-5 text-white/65">
                      Evaluate biodiversity risk and ecosystem services.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm font-semibold text-white">Report</p>
                    <p className="mt-1 text-xs leading-5 text-white/65">
                      Support disclosure and decision-ready outputs.
                    </p>
                  </div>
                </div>

                <div className="h-36 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
                  <svg viewBox="0 0 500 140" className="h-full w-full">
                    <defs>
                      <linearGradient id="heroA" x1="0" x2="1">
                        <stop offset="0%" stopColor="rgba(52,211,153,0.1)" />
                        <stop offset="100%" stopColor="rgba(59,130,246,0.5)" />
                      </linearGradient>
                      <linearGradient id="heroB" x1="0" x2="1">
                        <stop offset="0%" stopColor="rgba(168,85,247,0.08)" />
                        <stop offset="100%" stopColor="rgba(52,211,153,0.45)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 95 C40 90, 70 72, 110 74 C150 76, 165 55, 205 58 C245 61, 275 44, 315 48 C355 53, 385 28, 425 36 C460 43, 485 24, 500 20"
                      fill="none"
                      stroke="url(#heroA)"
                      strokeWidth="3"
                    />
                    <path
                      d="M0 108 C55 102, 85 96, 120 85 C155 74, 190 92, 235 80 C280 68, 320 85, 360 73 C400 61, 440 66, 500 48"
                      fill="none"
                      stroke="url(#heroB)"
                      strokeWidth="3"
                    />
                    <circle cx="315" cy="48" r="5" fill="rgba(52,211,153,0.9)" />
                    <circle cx="425" cy="36" r="5" fill="rgba(96,165,250,0.9)" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Core capabilities
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              A platform built around three essential pillars
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.key}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-80 transition group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-5 h-28 overflow-hidden rounded-2xl border border-white/10 bg-black/20 ring-1 ring-white/5">
                    <TileGraphic type={pillar.key} />
                  </div>

                  <h3 className="text-2xl font-semibold tracking-tight text-white">
                    <span className="font-bold">{pillar.title}</span>
                  </h3>
                  <p className="mt-2 text-lg font-medium text-white/85">
                    {pillar.subtitle}
                  </p>
                  <p className="mt-4 text-sm text-white/60">{pillar.example}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/60">
                Call to action
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                Are you looking to fund, build, or support Nature-Based Solutions?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                Whether you are an investor, provider, policymaker, or ecosystem
                partner, this platform helps you understand biodiversity value,
                assess environmental risk, and move toward trusted action.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/support"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-400/20 px-5 py-3 text-sm font-semibold text-emerald-50 ring-1 ring-emerald-200/30 transition hover:bg-emerald-400/25"
                >
                  Contact support
                </Link>
                <Link
                  href="/risk-model"
                  className="inline-flex items-center justify-center rounded-xl bg-white/8 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/12"
                >
                  Explore the risk model
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {audiences.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5 transition hover:border-emerald-300/25 hover:bg-black/30"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {item.text}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-emerald-200/0 transition group-hover:text-emerald-200">
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
