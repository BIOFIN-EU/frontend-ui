"use client";

import { useState } from "react";

type ContactReason =
  | "I am an NBS Funder"
  | "NBS Policy Maker"
  | "I want to get funding for my NBS"
  | "";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState<ContactReason>("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("https://api.example.com/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          reason,
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Something went wrong while submitting the form.");
      }

      setSuccess("Your message has been sent.");
      setName("");
      setEmail("");
      setReason("");
      setComment("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to submit form.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          Support
        </h1>
        <p className="text-sm text-white/70">
          Need help or want to get in touch? We're here to support you.
        </p>
      </header>

      {/* SUPPORT INFO BLOCK */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Help & guidance
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          How can we help you?
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
            <p className="text-sm font-semibold text-white">
              NBS Funders
            </p>
            <p className="mt-2 text-sm text-white/70">
              Looking for investment opportunities or tools to assess biodiversity impact? Reach out and we’ll guide you.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
            <p className="text-sm font-semibold text-white">
              Policy Makers
            </p>
            <p className="mt-2 text-sm text-white/70">
              Explore governance frameworks, reporting standards, and policy insights to support biodiversity finance.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
            <p className="text-sm font-semibold text-white">
              NBS Providers
            </p>
            <p className="mt-2 text-sm text-white/70">
              Need funding or visibility for your nature-based solution? We can help connect you with the right tools and partners.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Contact form
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Get in touch
        </h2>

        <form onSubmit={onSubmit} className="mt-6 grid max-w-2xl gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/70">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/5 outline-none transition focus:border-emerald-300/30 focus:ring-emerald-300/20"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/70">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/5 outline-none transition focus:border-emerald-300/30 focus:ring-emerald-300/20"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/70">
              I am contacting you as
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ContactReason)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white ring-1 ring-white/5 outline-none transition focus:border-emerald-300/30 focus:ring-emerald-300/20"
            >
              <option value="" disabled className="bg-slate-900">
                Select an option
              </option>
              <option value="I am an NBS Funder">I am an NBS Funder</option>
              <option value="NBS Policy Maker">NBS Policy Maker</option>
              <option value="I want to get funding for my NBS">
                I want to get funding for my NBS
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/70">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/5 outline-none transition focus:border-emerald-300/30 focus:ring-emerald-300/20"
              placeholder="Tell us more..."
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/30 transition hover:bg-emerald-400/20"
          >
            {loading ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>
    </div>
  );
}