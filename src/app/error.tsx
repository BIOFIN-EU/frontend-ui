"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonClass } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

// Shown when a page crashes while rendering, instead of a blank screen.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="space-y-6 py-12">
      <PageHeader
        eyebrow="Error"
        title="Something went wrong"
        subtitle="This page couldn't be displayed. Try again, and if it keeps happening, contact support."
      />
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={buttonClass("secondary")}>
          Go to home
        </Link>
      </div>
    </section>
  );
}
