import type { PhotoCredit } from "@/lib/photo-credits";

/**
 * A photo's credit in its corner, like the page backdrop's. Place it inside a
 * `relative` parent, outside any link (a link can't hold another link). The
 * faint pill keeps it readable on bright parts of a photo.
 */
export function PhotoCreditLink({ credit, className = "" }: { credit: PhotoCredit; className?: string }) {
  return (
    <a
      href={credit.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`absolute bottom-2 right-3 z-10 rounded-full bg-canvas/60 px-2 py-0.5 text-[11px] !text-fg/60 backdrop-blur-sm hover:!text-fg/90 ${className}`}
    >
      {credit.label}
    </a>
  );
}
