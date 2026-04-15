"use client";

import Link from "next/link";

const objectives = [
  "Create and test solutions to quickly and effectively gather and share valuable biodiversity and ecosystem services data.",
  "Understand investor, institution, and NbS-provider preferences and regulations to improve governance, business models, and financial instruments.",
  "Develop trustworthy and fair biodiversity and ecosystem services data sharing to reduce transaction costs and barriers to nature finance.",
  "Design and test new business models and biodiversity-linked investments that protect NbS providers and communities.",
  "Support reporting, disclosure, and decision-making processes that direct financial flows toward biodiversity protection and restoration.",
  "Build skills and knowledge among finance professionals and decision-makers to accelerate biodiversity-linked activity.",
];

const highlights = [
  {
    title: "Mission",
    text: "BIOFIN-EU aims to unlock finance to protect and restore biodiversity by building a comprehensive framework and technology for nature-positive investments.",
  },
  {
    title: "NbS Dashboard",
    text: "The project’s dashboard brings together an NbS Database, a Business Builder, and a Data Analytics & Underwriting Engine.",
  },
  {
    title: "Learning Sites",
    text: "BIOFIN-EU is testing and validating solutions across 10 learning sites with different stakeholders and nature-based solutions.",
  },
  {
    title: "Consortium",
    text: "The consortium brings together 13 partners from 10 European countries spanning research, innovation, industry, and sustainability expertise.",
  },
];

const stats = [
  { value: "13", label: "Partners" },
  { value: "10", label: "Countries" },
  { value: "10", label: "Learning sites" },
  { value: "3", label: "Core dashboard tools" },
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
          About BIOFIN-EU
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Unlocking finance to protect and restore biodiversity
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
            BIOFIN-EU is an EU-funded project focused on making nature-positive
            investment easier through better biodiversity data, stronger
            governance models, and practical tools for decision-makers.
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5"
            >
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-white/50">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Overview
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Why this project matters
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/70">
            BIOFIN-EU is building an advanced, science-driven analytics
            environment to support financial decisions that generate positive
            outcomes for nature. The project addresses barriers that make it
            difficult to finance Nature-Based Solutions, while also providing
            guidance, training, and practical frameworks for investment and
            reporting.
          </p>
          <p className="mt-4 text-sm leading-6 text-white/70">
            The broader goal is to reduce the friction around biodiversity
            finance by improving how ecosystem services and biodiversity data are
            gathered, shared, analysed, and translated into trusted financial
            decision-making tools.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100/70">
            Quick links
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-white/8 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/12 hover:ring-white/25 active:translate-y-[1px]"
            >
              Home Page
            </Link>
            <a
              href="https://biofin-project.eu/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-400/15 px-5 py-2.5 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/30 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:bg-emerald-400/20 hover:ring-emerald-200/40 active:translate-y-[1px]"
            >
              Visit official project site
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              {item.title}
            </p>
            <p className="mt-3 text-sm leading-6 text-white/75">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Objectives
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          What BIOFIN-EU is working on
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {objectives.map((objective, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-white/10 to-white/5 text-sm font-semibold text-white ring-1 ring-white/10">
                {index + 1}
              </div>
              <p className="mt-4 text-sm leading-6 text-white/75">
                {objective}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Expected impact
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Tools, policy guidance, and skills for biodiversity finance
            </h2>
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
            Nature-positive finance
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
            <p className="text-sm font-semibold text-white">
              Data & analytics infrastructure
            </p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              The project is building tools to discover, use, and contribute
              biodiversity and ecosystem-services data, while supporting
              analytics for underwriting and investment decisions.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
            <p className="text-sm font-semibold text-white">
              Business and governance support
            </p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              BIOFIN-EU also supports decision-making through governance options,
              business-model development, and policy recommendations tied to
              disclosure and accounting standards.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
            <p className="text-sm font-semibold text-white">
              Knowledge acceleration
            </p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Training, case studies, mentoring, and simulation activities are
              part of the project’s effort to strengthen capabilities across the
              finance ecosystem.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
            <p className="text-sm font-semibold text-white">
              Real-world validation
            </p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Through its learning sites, the project validates different
              approaches to financing and scaling nature-based solutions in
              practical settings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}