"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/context/auth.context";
import { Select } from "@/components/ui/Select";
import { apiFetch } from "@/lib/api";
import { buttonClass } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/Field";
import { PageBackdrop } from "@/components/PageBackdrop";
import { photoCredits } from "@/lib/photo-credits";
import ballycastle from "../../../public/images/ballycastle-county-mayo.jpg";
import { Alert } from "@/components/ui/Alert";

type ContactReason =
  | "I am an Nature-based Solutions Funder"
  | "I am an Nature-based Solutions Intermediary"
  | "I want to get funding for my Nature-based Solutions"
  | "I want to leave feedback"
  | "";

// ?reason=feedback (the profile page's "Leave feedback") preselects this.
const FEEDBACK_REASON: ContactReason = "I want to leave feedback";

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-300/20 bg-accent-400/10 text-accent-200">
      {children}
    </div>
  );
}

function FunderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
      <path d="m4 7 6-4 6 6 5-5" />
    </svg>
  );
}

function IntermediaryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="m7 7.5 2.6 2.6M17 7.5l-2.6 2.6M7 16.5l2.6-2.6M17 16.5l-2.6-2.6" />
    </svg>
  );
}

function ProviderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21V10M12 14c-5 0-8-3-8-8 5 0 8 3 8 8Z" />
      <path d="M12 11c0-4 3-7 8-7 0 5-3 8-8 8M6 21h12" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function SupportIllustration() {
  return (
    <svg
      viewBox="0 0 520 260"
      className="h-full w-full"
      role="img"
      aria-label="Nature-based solutions support workflow"
    >
      <defs>
        <linearGradient
          id="supportConnection"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="52%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>

        <linearGradient
          id="supportParcel"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.08" />
        </linearGradient>

        <radialGradient id="supportBackgroundGlow">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>

        <filter
          id="supportNodeGlow"
          x="-80%"
          y="-80%"
          width="260%"
          height="260%"
        >
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter
          id="supportShadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="12"
            floodColor="#000000"
            floodOpacity="0.28"
          />
        </filter>
      </defs>

      {/* Background glow */}
      <ellipse
        cx="270"
        cy="136"
        rx="238"
        ry="132"
        fill="url(#supportBackgroundGlow)"
      />

      {/* Subtle landscape contours */}
      <g
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
      >
        <path d="M15 221 C82 190 132 205 185 184 C248 159 304 180 361 159 C414 139 463 152 510 124" />
        <path d="M8 239 C75 208 139 224 196 202 C253 180 312 201 374 179 C424 162 468 171 518 147" />
        <path d="M46 201 C97 176 139 187 181 169" />
        <path d="M370 142 C416 124 458 132 501 106" />
      </g>

      {/* Decorative location dots */}
      <g fill="#34d399">
        <circle cx="34" cy="52" r="2" fillOpacity="0.45" />
        <circle cx="73" cy="35" r="1.5" fillOpacity="0.25" />
        <circle cx="478" cy="46" r="2" fillOpacity="0.35" />
        <circle cx="497" cy="83" r="1.5" fillOpacity="0.25" />
      </g>

      {/* Main connecting route */}
      <path
        d="M126 152 C170 152 183 130 213 130"
        fill="none"
        stroke="url(#supportConnection)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />

      <path
        d="M307 130 C344 130 356 152 394 152"
        fill="none"
        stroke="url(#supportConnection)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />

      {/* Small moving indicators */}
      <circle
        cx="170"
        cy="143"
        r="4"
        fill="#34d399"
        filter="url(#supportNodeGlow)"
      />

      <circle
        cx="351"
        cy="140"
        r="4"
        fill="#60a5fa"
        filter="url(#supportNodeGlow)"
      />

      {/* LEFT: people/support card */}
      <g filter="url(#supportShadow)">
        <rect
          x="44"
          y="108"
          width="84"
          height="88"
          rx="20"
          fill="#101d2b"
          stroke="rgba(52,211,153,0.4)"
          strokeWidth="1.5"
        />

        <rect
          x="54"
          y="118"
          width="64"
          height="68"
          rx="15"
          fill="rgba(52,211,153,0.055)"
          stroke="rgba(255,255,255,0.05)"
        />

        {/* Three separate people */}
        <g
            fill="none"
            stroke="#99f6e4"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
          {/* Left person */}
          <circle cx="68" cy="143" r="5"/>
          <path d="M59 169 C59 160 62 154 68 154 C74 154 77 160 77 169"/>

          {/* Centre person */}
          <circle cx="86" cy="137" r="6"/>
          <path d="M76 169 C76 158 80 150 86 150 C92 150 96 158 96 169"/>

          {/* Right person */}
          <circle cx="104" cy="143" r="5"/>
          <path d="M95 169 C95 160 98 154 104 154 C110 154 113 160 113 169"/>
        </g>

        <circle cx="65" cy="126" r="3" fill="#34d399" />
      </g>

      {/* CENTRE: biodiversity parcel */}
      <g filter="url(#supportShadow)">
        <rect
          x="202"
          y="71"
          width="116"
          height="124"
          rx="27"
          fill="#0c2529"
          stroke="#34d399"
          strokeWidth="1.6"
        />

        <rect
          x="212"
          y="81"
          width="96"
          height="104"
          rx="21"
          fill="url(#supportParcel)"
          stroke="rgba(126,226,193,0.12)"
        />

        {/* Land parcel */}
        <path
          d="M230 145 L260 161 L290 145 L260 129 Z"
          fill="rgba(45,212,191,0.08)"
          stroke="#7ee2c1"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />

        <path
          d="M230 134 L260 150 L290 134"
          fill="none"
          stroke="#7ee2c1"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Leaf */}
        <path
          d="M261 119 C260 96 275 87 294 90 C295 109 283 122 261 119 Z"
          fill="#34d399"
          fillOpacity="0.9"
        />

        <path
          d="M265 116 C273 107 281 100 290 94"
          fill="none"
          stroke="#d1fae5"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M276 105 C271 102 268 98 266 94"
          fill="none"
          stroke="#d1fae5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />

        {/* Status badge */}
        <g transform="translate(260 67)">
          <circle
            r="22"
            fill="#12263a"
            stroke="#60a5fa"
            strokeWidth="1.6"
          />

          <circle
            r="15"
            fill="rgba(96,165,250,0.08)"
          />

          <path
            d="M-8 0 L-2 6 L9 -7"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>

      {/* RIGHT: completed report card */}
      <g filter="url(#supportShadow)">
        <rect
          x="392"
          y="108"
          width="84"
          height="88"
          rx="20"
          fill="#111f32"
          stroke="rgba(96,165,250,0.48)"
          strokeWidth="1.5"
        />

        <rect
          x="402"
          y="118"
          width="64"
          height="68"
          rx="15"
          fill="rgba(96,165,250,0.055)"
          stroke="rgba(255,255,255,0.05)"
        />

        <path
          d="M417 131 H440 L451 142 V174 H417 Z"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M440 131 V142 H451"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M424 151 H443"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />

        <path
          d="M424 158 H439"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.55"
        />

        <path
          d="M424 167 L429 171 L438 162"
          fill="none"
          stroke="#34d399"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="456" cy="126" r="3" fill="#60a5fa" />
      </g>

      {/* Base shadows */}
      <ellipse
        cx="86"
        cy="211"
        rx="36"
        ry="5"
        fill="#000000"
        fillOpacity="0.18"
      />

      <ellipse
        cx="260"
        cy="211"
        rx="50"
        ry="6"
        fill="#000000"
        fillOpacity="0.22"
      />

      <ellipse
        cx="434"
        cy="211"
        rx="36"
        ry="5"
        fill="#000000"
        fillOpacity="0.18"
      />
    </svg>
  );
}

const supportCards = [
  {
    title: "Nature-based Solutions Funders",
    description: "Looking for investment opportunities or tools to assess biodiversity impact? Reach out and we’ll guide you.",
    reason: "I am an Nature-based Solutions Funder" as ContactReason,
    icon: <FunderIcon />,
  },
  {
    title: "Nature-based Solutions Intermediaries",
    description: "Certify, guide, and verify nature-based solutions that deliver real impact.",
    reason: "I am an Nature-based Solutions Intermediary" as ContactReason,
    icon: <IntermediaryIcon />,
  },
  {
    title: "Nature-based Solutions Providers",
    description: "Need funding or visibility for your nature-based solution? We can help connect you with the right tools and partners.",
    reason: "I want to get funding for my Nature-based Solutions" as ContactReason,
    icon: <ProviderIcon />,
  },
];

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState<ContactReason>("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();
  const [isFeedback, setIsFeedback] = useState(false);

  // From "Leave feedback": preselect the reason and fill in who is logged in.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("reason") !== "feedback") return;
    setIsFeedback(true);
    setReason(FEEDBACK_REASON);
  }, []);

  useEffect(() => {
    if (!isFeedback || !user) return;
    setName((current) => current || user.name || "");
    setEmail((current) => current || user.email || "");
  }, [isFeedback, user]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch("/api/support/contact", {
        method: "POST",
        body: JSON.stringify({ name, email, reason, comment }),
      });

      setSuccess(reason === FEEDBACK_REASON ? "Thank you for your feedback." : "Your message has been sent.");
      setName("");
      setEmail("");
      setReason("");
      setComment("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit form.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative isolate space-y-8 pb-10">
      <PageBackdrop
        image={ballycastle}
        credit={photoCredits.ballycastle}
        heightClassName="h-[560px] lg:h-[620px]"
        objectPositionClassName="object-[50%_40%]"
        scrim="light"
      />

      <section className="relative overflow-hidden rounded-3xl border border-fg/10 bg-deep/55 shadow-panel backdrop-blur-sm">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="relative grid min-h-[280px] items-center gap-8 px-4 py-6 sm:px-7 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <header className="max-w-2xl space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl">Support</h1>
            <p className="max-w-xl text-base leading-7 text-fg/70">Need help or want to get in touch? We&apos;re here to support you.</p>
            <a href="#contact-form" className={`mt-4 gap-2 ${buttonClass("primary")}`}>
              Get in touch <span aria-hidden="true">→</span>
            </a>
          </header>
          <div className="hidden h-[240px] lg:block"><SupportIllustration /></div>
        </div>
      </section>

      <section className="rounded-2xl surface-panel p-4 shadow-panel backdrop-blur-md sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-fg/50">Help &amp; guidance</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg">How can we help you?</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {supportCards.map((card) => (
            <button key={card.title} type="button" onClick={() => { setReason(card.reason); document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="group rounded-2xl surface-card p-4 sm:p-5 text-left ring-1 ring-fg/5 transition hover:-translate-y-1 hover:border-accent-300/25 hover:bg-fg/[0.06]">
              <div className="flex items-start justify-between gap-4">
                <IconFrame>{card.icon}</IconFrame>
                <span className="text-lg text-fg/25 transition group-hover:translate-x-1 group-hover:text-accent-200">→</span>
              </div>
              <p className="mt-5 text-sm font-semibold text-fg">{card.title}</p>
              <p className="mt-2 text-sm leading-6 text-fg/70">{card.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section id="contact-form" className="scroll-mt-24 rounded-2xl surface-panel p-4 shadow-panel backdrop-blur-md sm:p-8">
        <div className="flex items-center gap-4">
          <IconFrame><MailIcon /></IconFrame>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-fg/50">Contact form</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-fg">
              {isFeedback ? "Leave feedback" : "Get in touch"}
            </h2>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-7 grid max-w-4xl gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="support-name" className="text-label">Name</label>
              <input id="support-name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" className={fieldClass("roomy")} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <label htmlFor="support-email" className="text-label">Email</label>
              <input id="support-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" className={fieldClass("roomy")} placeholder="you@example.com" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-label">What is your message about?</label>
            <Select value={String(reason ?? "")} onChange={(nextValue) => setReason(nextValue as ContactReason)} options={[
              { label: "Select an option", value: "" },
              { label: "I'm a Nature-based Solutions funder", value: "I am an Nature-based Solutions Funder" },
              { label: "I'm a Nature-based Solutions intermediary", value: "I am an Nature-based Solutions Intermediary" },
              { label: "I'm looking for funding for my Nature-based Solutions", value: "I want to get funding for my Nature-based Solutions" },
              { label: "Feedback about the platform", value: FEEDBACK_REASON },
              { label: "Something else", value: "I am someone else" }
            ]} />
          </div>

          <div className="space-y-2">
            <label htmlFor="support-comment" className="text-label">Comment</label>
            <textarea id="support-comment" value={comment} onChange={(e) => setComment(e.target.value)} required rows={5} className={`${fieldClass("roomy")} resize-y`} placeholder={reason === FEEDBACK_REASON ? "What works well, and what could be better?" : "Tell us more..."} />
          </div>

          {error && <Alert tone="danger" role="alert">{error}</Alert>}
          {success && <Alert tone="success" role="status">{success}</Alert>}

          <button type="submit" disabled={loading} className={`gap-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit ${buttonClass("primary")}`}>
            <MailIcon />
            {loading ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>
    </div>
  );
}