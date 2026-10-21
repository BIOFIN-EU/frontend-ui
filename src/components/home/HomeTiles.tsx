import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Lock, Route, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import forest from "../../../public/images/forest-dieny-portinanni.jpg";
import haifoss from "../../../public/images/haifoss-waterfall-iceland.jpg";
import daintreeRiver from "../../../public/images/daintree-river-australia.jpg";
import { photoCredits, type PhotoCredit } from "@/lib/photo-credits";
import { PhotoCreditLink } from "./PhotoCreditLink";
import { SignedOutOnly } from "./SignedOutOnly";
import { iconCircle } from "./styles";

type Tile = {
  key: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  external?: boolean;
  // Needs an account: labelled for signed-out visitors.
  loginRequired?: boolean;
  icon: LucideIcon;
  image: StaticImageData;
  imagePosition: string;
  credit: PhotoCredit;
};

// Where to go next. Pathways and Intermediaries ask a signed-out visitor to
// log in first, then open the page.
const tiles: Tile[] = [
  {
    key: "pathways",
    title: "Find a pathway",
    text: "Follow a guided route to the type of finance that fits your project, with the information and documents funders need.",
    href: "/pathways",
    cta: "Explore pathways",
    loginRequired: true,
    icon: Route,
    image: daintreeRiver,
    imagePosition: "object-[70%_50%]",
    credit: photoCredits.daintreeRiver,
  },
  {
    key: "intermediaries",
    title: "Connect with intermediaries",
    text: "Browse organisations that can help shape projects, connect partners and unlock finance.",
    href: "/intermediaries",
    cta: "View intermediaries",
    loginRequired: true,
    icon: Users,
    image: forest,
    imagePosition: "object-center",
    credit: photoCredits.forest,
  },
  {
    key: "about",
    // Non-breaking hyphen: "BIOFIN-EU" stays on one line.
    title: "Learn about BIOFIN\u2011EU",
    text: "Discover the Horizon Europe project behind the platform, its mission and partners.",
    href: "https://biofin-project.eu/",
    cta: "Visit project website",
    external: true,
    icon: BookOpen,
    image: haifoss,
    imagePosition: "object-[55%_50%]",
    credit: photoCredits.haifoss,
  },
];

/**
 * Tiles with a photo fading in on the right. The fade uses the page colour
 * (canvas), so it follows light and dark mode.
 */
export function HomeTiles() {
  return (
    <section aria-label="Get started" className="grid gap-4 md:grid-cols-3">
      {tiles.map(({ key, title, text, href, cta, external, loginRequired, icon: Icon, image, imagePosition, credit }) => {
        const Arrow = external ? ArrowUpRight : ArrowRight;
        return (
          // The credit sits beside the tile's link, over the photo's corner.
          <div key={key} className="relative flex">
            <Link
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group relative isolate flex min-h-56 w-full overflow-hidden rounded-2xl border border-fg/10 bg-canvas shadow-panel-soft transition duration-200 hover:border-accent-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
            >
              {/* overflow-hidden: the photo grows on hover and must stay under its fade. */}
              <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-[55%] overflow-hidden">
                <Image
                  src={image}
                  alt=""
                  fill
                  placeholder="blur"
                  sizes="(min-width: 768px) 17vw, 50vw"
                  className={`object-cover transition duration-500 group-hover:scale-105 ${imagePosition}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/60 to-canvas/0" />
              </div>

              <div className="flex w-full flex-col justify-between gap-4 p-6 pr-[38%]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`h-12 w-12 ${iconCircle}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {loginRequired && (
                      <SignedOutOnly>
                        <span className="inline-flex items-center gap-1 rounded-full bg-fg/10 px-2.5 py-1 text-xs font-semibold text-fg/75 ring-1 ring-fg/10">
                          <Lock className="h-3 w-3" aria-hidden="true" />
                          Login required
                        </span>
                      </SignedOutOnly>
                    )}
                  </div>
                  <p className="mt-4 text-xl font-semibold tracking-tight text-fg">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-fg/75">{text}</p>
                </div>
                <span className="flex items-center gap-2 text-sm font-semibold text-accent-200 transition group-hover:text-accent-100">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent-300/50 transition group-hover:bg-accent-400/15">
                    <Arrow className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {cta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                  {external && <span className="sr-only">(opens in a new tab)</span>}
                </span>
              </div>
            </Link>
            <PhotoCreditLink credit={credit} />
          </div>
        );
      })}
    </section>
  );
}
