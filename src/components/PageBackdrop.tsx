import Image, { type StaticImageData } from "next/image";
import type { PhotoCredit } from "@/lib/photo-credits";

type Props = {
  image: StaticImageData;
  credit: PhotoCredit;
  // Tailwind height classes for the photo band, e.g. "h-[560px] lg:h-[640px]".
  heightClassName: string;
  // Tailwind object-position class choosing the photo's focal area.
  objectPositionClassName?: string;
  // "left": dark on the left where page copy sits (lg and up), even on small
  // screens. "even": the same darkening across the whole photo, for copy
  // placed straight on it. "light": a lighter even darkening, for pages whose
  // copy sits in its own cards over the photo.
  scrim?: "left" | "even" | "light";
  priority?: boolean;
};

/**
 * Full-width photo behind the top of a page. Render it as the first child of
 * a `relative isolate` page root: it breaks out of the layout's max-w-7xl
 * container to the viewport width (the layout wrapper clips horizontal
 * overflow), starts under main's top padding, and fades into the page
 * background. The credit sits in main's top padding, aligned with the content.
 */
export function PageBackdrop({
  image,
  credit,
  heightClassName,
  objectPositionClassName = "object-center",
  scrim = "even",
  priority = true,
}: Props) {
  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-6 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden ${heightClassName}`}
      >
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          placeholder="blur"
          sizes="100vw"
          className={`object-cover ${objectPositionClassName}`}
        />

        {scrim === "left" ? (
          <>
            <div className="absolute inset-0 bg-photo-scrim lg:hidden" />
            <div className="absolute inset-0 hidden bg-photo-scrim-left lg:block" />
          </>
        ) : (
          <div
            className={`absolute inset-0 ${scrim === "light" ? "bg-photo-scrim-light" : "bg-photo-scrim"}`}
          />
        )}

        {/* Soft top edge under the header, and a fade into the page background */}
        <div className="absolute inset-0 bg-photo-fade" />
      </div>

      <a
        href={credit.href}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute -top-5 right-0 z-10 text-[11px] !text-fg/55 hover:!text-fg/80"
      >
        {credit.label}
      </a>
    </>
  );
}
