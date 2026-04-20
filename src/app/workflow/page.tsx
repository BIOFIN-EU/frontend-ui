"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { workflowService } from "@/services/workflow.service";

const workflows = [
  {
    code: "private_lending_v1",
    title: "Private Lending",
    description: "Standard workflow with financial and identifier steps.",
  },
  {
    code: "private_lending_with_document_v1",
    title: "Private Lending (with document)",
    description: "Includes supporting document upload step.",
  }
];

export default function WorkflowPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [startingCode, setStartingCode] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Workflow
        </h1>
        <p className="text-sm text-white/70">Loading workflow access…</p>
      </section>
    );
  }

  async function handleStartWorkflow(code: string) {
    try {
      setStartingCode(code);
      setError("");

      const created = await workflowService.startWorkflow(code);
      router.push(`/workflow/${created.case_id}`);
        } catch (err) {
      console.error("start workflow failed", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to start workflow");
      }
    } finally {
      setStartingCode(null);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="inline-flex w-fit items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
          Workflow
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Start a new workflow
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
            Create and run structured workflows for private lending, document
            submission, and nature-based solution data collection.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        {workflows.map((wf) => (
          <div
            key={wf.code}
            className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Workflow
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              {wf.title}
            </h2>

            <p className="mt-3 text-sm text-white/70">{wf.description}</p>

            <div className="mt-5">
              <button
                onClick={() => handleStartWorkflow(wf.code)}
                disabled={startingCode === wf.code}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-400/15 px-5 py-2.5 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/30 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:bg-emerald-400/20 hover:ring-emerald-200/40 active:translate-y-[1px] disabled:opacity-50"
              >
                {startingCode === wf.code ? "Starting..." : "Start workflow"}
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}