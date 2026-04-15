"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth.context";

function initialFromEmail(email?: string) {
  return (email?.trim()?.[0] ?? "?").toUpperCase();
}

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Profile</h1>
        <p className="text-sm text-white/70">Loading profile…</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-white">Profile</h1>
        <p className="text-sm text-white/70">Manage your account details and settings.</p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/10 text-white text-sm font-semibold">
              {initialFromEmail(user.email)}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Account
              </p>
            </div>
          </div>

          <span className="sm:ml-auto inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
            Active
          </span>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
          <p className="text-xs font-medium text-white/70">Email address</p>
          <p className="mt-1 text-sm font-semibold text-white break-all">{user.email}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/change-password"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-400/15 px-5 py-2.5 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/30 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:bg-emerald-400/20 hover:ring-emerald-200/40 active:translate-y-[1px]"
          >
            Change password
          </Link>

          <Link
            href="/feedback"
            className="inline-flex items-center justify-center rounded-xl bg-white/8 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/12 hover:ring-white/25 active:translate-y-[1px]"
          >
            Leave feedback
</Link>
        </div>

        <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 ring-1 ring-white/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-red-100">Close account</p>
              <p className="mt-1 text-xs text-red-100/70">This action is permanent.</p>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-xl bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-100 ring-1 ring-red-400/35 transition hover:bg-red-500/20"
              onClick={() => alert("Hook this up to your close account flow.")}
            >
              Close account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}