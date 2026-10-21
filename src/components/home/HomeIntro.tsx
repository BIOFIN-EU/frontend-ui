import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Headset } from "lucide-react";
import womanTouchingTree from "../../../public/images/woman-touching-tree.jpg";
import { photoCredits } from "@/lib/photo-credits";
import { PhotoCreditLink } from "./PhotoCreditLink";
import { iconCircle, solidButton } from "./styles";

/** Closing band: where to get help, with a photo fading in on the right. */
export function HomeIntro() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-fg/10 bg-canvas p-6 shadow-panel-soft sm:p-8">
      <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 overflow-hidden md:block">
        <Image
          src={womanTouchingTree}
          alt=""
          fill
          placeholder="blur"
          sizes="50vw"
          className="object-cover object-[35%_50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/60 to-canvas/10" />
      </div>
      <PhotoCreditLink credit={photoCredits.womanTouchingTree} className="hidden md:inline" />

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-5">
          <span className={`hidden h-16 w-16 sm:flex ${iconCircle}`}>
            <Headset className="h-8 w-8" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">Support</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              Not sure where to start?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-fg/80">
              Whether you fund, build or support nature-based solutions, our team can help you
              choose a pathway and prepare your project.
            </p>
          </div>
        </div>

        <Link href="/support" className={`shrink-0 ${solidButton}`}>
          Contact support
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
