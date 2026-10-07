"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as auth from "@/services/auth.service";
import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState(""); // kept in case you want it later
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      await auth.register(email, password);
      router.push("/login");
    } catch (e: any) {
      setErr(e?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-fg">
          Sign up
        </h1>
        <p className="text-sm text-fg/70">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-accent-200 underline decoration-accent-300/40 underline-offset-4 transition hover:text-accent-100"
          >
            Login here
          </Link>
        </p>
      </header>

      <section className="rounded-2xl surface-panel p-4 sm:p-6 shadow-panel backdrop-blur-md">
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
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
      </section>
    </div>
  );
}