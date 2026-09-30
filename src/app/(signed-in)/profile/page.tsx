"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth.context";
import { closeAccount } from "@/services/auth.service";
import { buttonClass } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

function initialFromEmail(email?: string) {
  return (email?.trim()?.[0] ?? "?").toUpperCase();
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState("");

  if (!user) return null;

  async function handleCloseAccount() {
    setClosing(true);
    setCloseError("");

    try {
      await closeAccount();
      await logout();
    } catch (err) {
      setCloseError(
        err instanceof Error ? err.message : "Failed to close account."
      );
      setClosing(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader size="lg" title="Profile" subtitle="Manage your account details and settings." />

      <section className="rounded-2xl surface-panel p-6 shadow-panel backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-fg/10 to-fg/5 ring-1 ring-fg/10 text-fg text-sm font-semibold">
              {initialFromEmail(user.email)}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-fg/50">
                Account
              </p>
            </div>
          </div>

          <span className="sm:ml-auto inline-flex w-fit items-center rounded-full bg-accent-500/15 px-3 py-1 text-xs font-semibold text-accent-200 ring-1 ring-accent-400/25">
            Active
          </span>
        </div>

        <div className="mt-5 rounded-xl surface-card p-4 ring-1 ring-fg/5">
          <p className="text-label">Email address</p>
          <p className="mt-1 text-sm font-semibold text-fg break-all">{user.email}</p>
        </div>
      </section>

      <section className="rounded-2xl surface-panel p-6 shadow-panel backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/profile/change-password"
            className={buttonClass("primary")}
          >
            Change password
          </Link>

          <Link
            href="/support?reason=feedback#contact-form"
            className={buttonClass("secondary")}
          >
            Leave feedback
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-danger-500/25 bg-danger-500/10 p-4 ring-1 ring-fg/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-danger-100">Close account</p>
              <p className="mt-1 text-xs text-danger-100/70">
                {confirming
                  ? "Are you sure? This action is permanent and cannot be undone."
                  : "This action is permanent."}
              </p>
              {closeError && (
                <p className="mt-2 text-xs text-danger-300">{closeError}</p>
              )}
            </div>

            {confirming ? (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  className={`disabled:cursor-not-allowed disabled:opacity-60 ${buttonClass("ghost")}`}
                  onClick={() => setConfirming(false)}
                  disabled={closing}
                >
                  Cancel
                </button>

                <button
                  className={`disabled:cursor-not-allowed disabled:opacity-60 ${buttonClass("danger")}`}
                  onClick={handleCloseAccount}
                  disabled={closing}
                >
                  {closing ? "Closing..." : "Confirm close"}
                </button>
              </div>
            ) : (
              <button
                className={`shrink-0 ${buttonClass("danger")}`}
                onClick={() => setConfirming(true)}
              >
                Close account
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}