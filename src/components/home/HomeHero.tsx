import Link from "next/link";
import { ArrowRight, ChartColumnIncreasing, Layers, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { SignedOutOnly } from "./SignedOutOnly";
import { iconCircle, solidButton } from "./styles";

// What the platform does, in the order a project goes through it.
const steps: { title: string; text: string; icon: LucideIcon }[] = [
  {
    title: "Classify",
    text: "Describe your project in a common language funders, intermediaries and partners can understand.",
    icon: Layers,
  },
  {
    title: "Assess",
    text: "Evaluate biodiversity opportunity, risk and resilience and access practical management guidance via the Vulnerability Index.",
    icon: ChartColumnIncreasing,
  },
  {
    title: "Communicate",
    text: "Share your project's data in a standard format for reporting, disclosures and collaboration.",
    icon: UsersRound,
  },
];

const textLink =
  "font-semibold text-accent-200 underline decoration-accent-300/40 underline-offset-4 hover:text-accent-100";

/** The home page's opening: heading and actions on the photo, what the platform does beside them. */
export function HomeHero() {
  return (
    <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-12">
      <div className="flex min-w-0 flex-col space-y-6">
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-fg sm:text-5xl lg:text-5xl lg:leading-[1.1] xl:text-[3.25rem]">
          Finance nature-based solutions with confidence.
        </h1>
        <p className="max-w-xl text-base leading-7 text-fg/85 sm:text-lg sm:leading-8">
          BIOFIN-EU enables landowners, borrowers, funders and intermediaries to assess biodiversity risks and
          opportunities, prepare investment-ready projects, and simplify disclosure and reporting.
        </p>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link href="/pathways" className={solidButton}>
            Explore pathways
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/support" className={buttonClass("secondary")}>
            Get support
          </Link>
        </div>

        <SignedOutOnly>
          <p className="max-w-xl text-sm leading-6 text-fg/70">
            <Link href="/login" className={textLink}>
              Log in
            </Link>{" "}
            or{" "}
            <Link href="/signup" className={textLink}>
              create an account
            </Link>{" "}
            to start a pathway, manage your projects and find intermediaries.
          </p>
        </SignedOutOnly>
      </div>

      <div
        className="min-w-0 rounded-3xl border border-fg/15 bg-canvas/75 p-2 shadow-panel backdrop-blur-md"
        aria-label="What the platform does"
        role="group"
      >
        <ol className="divide-y divide-fg/10">
          {steps.map(({ title, text, icon: Icon }) => (
            <li key={title} className="flex items-center gap-5 p-5">
              <span className={`h-14 w-14 ${iconCircle}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-fg">{title}</p>
                <p className="mt-1 text-sm leading-6 text-fg/75">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
