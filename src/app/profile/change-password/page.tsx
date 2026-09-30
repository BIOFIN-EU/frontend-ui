"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as auth from "@/services/auth.service";
import { useAuth } from "@/context/auth.context";
import { ApiError } from "@/lib/api";
import { buttonClass } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
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

        await logout(); // 🔥 CRITICAL FIX

        router.replace("/login?reason=password-changed");
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
        <h1 className="text-4xl font-semibold tracking-tight text-fg">
          Change password
        </h1>
        <p className="text-sm text-fg/70">
          Back to{" "}
          <Link
            href="/profile"
            className="font-semibold text-accent-200 underline decoration-accent-300/40 underline-offset-4 transition hover:text-accent-100"
          >
            profile
          </Link>
        </p>
      </header>

      <section className="rounded-2xl surface-panel p-6 shadow-panel backdrop-blur-md">
        <div className="mb-4">
          <p className="text-xs text-fg/50">
            <span className="font-semibold text-danger-300">*</span> Required fields
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid max-w-md gap-4">
          <div className="space-y-2">
            <label
              htmlFor="current-password"
              className="text-label"
            >
              Current password <span className="text-danger-300">*</span>
            </label>
            <input
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              placeholder="Current password"
              required
              className={fieldClass("roomy")}
            />
            {fieldErrors.current_password ? (
              <p className="text-xs font-medium text-danger-200">
                {fieldErrors.current_password}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="new-password"
              className="text-label"
            >
              New password <span className="text-danger-300">*</span>
            </label>
            <input
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="New password"
              required
              className={fieldClass("roomy")}
            />
            {fieldErrors.new_password ? (
              <p className="text-xs font-medium text-danger-200">
                {fieldErrors.new_password}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="text-label"
            >
              Confirm new password <span className="text-danger-300">*</span>
            </label>
            <input
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Confirm new password"
              required
              className={fieldClass("roomy")}
            />
            {fieldErrors.confirm_password ? (
              <p className="text-xs font-medium text-danger-200">
                {fieldErrors.confirm_password}
              </p>
            ) : null}
          </div>

          {err ? (
            <Alert tone="danger">
              {err}
            </Alert>
          ) : null}


          <button
            type="submit"
            disabled={loading}
            className={`disabled:cursor-not-allowed disabled:opacity-60 ${buttonClass("primary")}`}
          >
            {loading ? "Updating…" : "Change password"}
          </button>
        </form>
      </section>
    </div>
  );
}