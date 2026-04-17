"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as auth from "@/services/auth.service";
import { ApiError } from "@/lib/api";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSuccess(null);
    setFieldErrors({});

    if (newPassword !== confirmPassword) {
      setFieldErrors({
        confirm_password: "Passwords do not match",
      });
      return;
    }

    setLoading(true);

    try {
      await auth.changePassword(currentPassword, newPassword);

      setSuccess("Password changed successfully. Please log in again.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(async () => {
        await auth.logout();
        router.replace("/login");
      }, 1200);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setErr(e.message || "Could not change password");
        setFieldErrors(e.fieldErrors ?? {});
      } else {
        setErr("Could not change password");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          Change password
        </h1>
        <p className="text-sm text-white/70">
          Back to{" "}
          <Link
            href="/profile"
            className="font-semibold text-emerald-200 underline decoration-emerald-300/40 underline-offset-4 transition hover:text-emerald-100"
          >
            profile
          </Link>
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="mb-4">
          <p className="text-xs text-white/50">
            <span className="font-semibold text-red-300">*</span> Required fields
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid max-w-md gap-4">
          <div className="space-y-2">
            <label
              htmlFor="current-password"
              className="text-xs font-medium text-white/70"
            >
              Current password <span className="text-red-300">*</span>
            </label>
            <input
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              placeholder="Current password"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/5 outline-none transition focus:border-emerald-300/30 focus:ring-emerald-300/20"
            />
            {fieldErrors.current_password ? (
              <p className="text-xs font-medium text-red-200">
                {fieldErrors.current_password}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="new-password"
              className="text-xs font-medium text-white/70"
            >
              New password <span className="text-red-300">*</span>
            </label>
            <input
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="New password"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/5 outline-none transition focus:border-emerald-300/30 focus:ring-emerald-300/20"
            />
            {fieldErrors.new_password ? (
              <p className="text-xs font-medium text-red-200">
                {fieldErrors.new_password}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="text-xs font-medium text-white/70"
            >
              Confirm new password <span className="text-red-300">*</span>
            </label>
            <input
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Confirm new password"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/5 outline-none transition focus:border-emerald-300/30 focus:ring-emerald-300/20"
            />
            {fieldErrors.confirm_password ? (
              <p className="text-xs font-medium text-red-200">
                {fieldErrors.confirm_password}
              </p>
            ) : null}
          </div>

          {err ? (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 ring-1 ring-red-400/20">
              {err}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-400/20">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/30 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:bg-emerald-400/20 hover:ring-emerald-200/40 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating…" : "Change password"}
          </button>
        </form>
      </section>
    </div>
  );
}