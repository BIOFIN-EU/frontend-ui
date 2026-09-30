import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NotFound() {
  return (
    <section className="space-y-6 py-12">
      <PageHeader eyebrow="404" title="Page not found" subtitle="This page doesn't exist or has been moved." />
      <Link href="/" className={buttonClass("primary")}>
        Go to home
      </Link>
    </section>
  );
}
