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
import { ArrowRight, ChartColumnIncreasing, ClipboardList, Route } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

// What support can help with, beside the page heading (in the style of the
// home page's panel).
const supportTopics: { title: string; text: string; icon: LucideIcon }[] = [
  { title: "Choosing a pathway", text: "Find the right route for your type of finance.", icon: Route },
  { title: "Preparing your project", text: "Get help with the information and documents each step needs.", icon: ClipboardList },
  { title: "Understanding your results", text: "Make sense of the Vulnerability Index and its recommended actions.", icon: ChartColumnIncreasing },
];

function SupportTopics() {
  return (
    <div className="rounded-3xl border border-fg/15 bg-canvas/75 p-3 shadow-panel backdrop-blur-md">
      <p className="px-4 pb-2 pt-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">
        We can help with
      </p>
      <ul className="space-y-1">
        {supportTopics.map(({ title, text, icon: Icon }) => (
          <li key={title}>
            {/* Each topic leads to the contact form, like the cards below. */}
            <a
              href="#contact-form"
              className="group flex items-center gap-4 rounded-2xl px-4 py-4 transition hover:bg-fg/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-400/15 text-accent-300 ring-1 ring-accent-400/25 transition group-hover:bg-accent-400/25">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-fg">{title}</span>
                <span className="mt-0.5 block text-sm leading-6 text-fg/70">{text}</span>
              </span>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-fg/30 transition group-hover:translate-x-1 group-hover:text-accent-200"
                aria-hidden="true"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
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
          <div className="hidden lg:block"><SupportTopics /></div>
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