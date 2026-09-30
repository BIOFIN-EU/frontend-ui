"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // 👈 merged
import { useAuth } from "@/context/auth.context";
import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";

// useSearchParams needs a Suspense boundary for the production build.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
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
        <h1 className="text-4xl font-semibold tracking-tight text-fg">Login</h1>
        <p className="text-sm text-fg/70">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/signup"
            className="font-semibold text-accent-200 underline decoration-accent-300/40 underline-offset-4 transition hover:text-accent-100"
          >
            Sign up here
          </Link>
        </p>
      </header>

      <section className="rounded-2xl surface-panel p-6 shadow-panel backdrop-blur-md">

        {/* ✅ SUCCESS MESSAGE GOES HERE */}
        {reason === "password-changed" && (
          <Alert tone="success" className="mb-4">
            Password updated. Please log in again.
          </Alert>
        )}

        <div className="mb-4">
          <p className="text-xs text-fg/50">
            <span className="font-semibold text-danger-300">*</span> Required fields
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid max-w-md gap-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-label">
              Email address <span className="text-danger-300">*</span>
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              required
              className={fieldClass("roomy")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-label">
              Password <span className="text-danger-300">*</span>
            </label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              required
              className={fieldClass("roomy")}
            />
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
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
      </section>
    </div>
  );
}