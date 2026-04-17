"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // 👈 merged
import { useAuth } from "@/context/auth.context";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ HERE
  const reason = searchParams.get("reason"); // ✅ HERE

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/profile");
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-white">Login</h1>
        <p className="text-sm text-white/70">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/signup"
            className="font-semibold text-emerald-200 underline decoration-emerald-300/40 underline-offset-4 transition hover:text-emerald-100"
          >
            Sign up here
          </Link>
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">

        {/* ✅ SUCCESS MESSAGE GOES HERE */}
        {reason === "password-changed" && (
          <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-400/20">
            Password updated. Please log in again.
          </div>
        )}

        <div className="mb-4">
          <p className="text-xs text-white/50">
            <span className="font-semibold text-red-300">*</span> Required fields
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid max-w-md gap-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-medium text-white/70">
              Email address <span className="text-red-300">*</span>
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/5 outline-none transition focus:border-emerald-300/30 focus:ring-emerald-300/20"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-medium text-white/70">
              Password <span className="text-red-300">*</span>
            </label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/5 outline-none transition focus:border-emerald-300/30 focus:ring-emerald-300/20"
            />
          </div>

          {err ? (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 ring-1 ring-red-400/20">
              {err}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/30 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:bg-emerald-400/20 hover:ring-emerald-200/40 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
      </section>
    </div>
  );
}