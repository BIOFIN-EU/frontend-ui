import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "muted" | "success" | "warning" | "danger" | "info" | "violet";

const TONE: Record<BadgeTone, string> = {
  neutral: "bg-fg/10 text-fg/60 ring-fg/10",
  muted: "bg-fg/5 text-fg/40 ring-fg/10",
  success: "bg-accent-500/15 text-accent-200 ring-accent-400/25",
  warning: "bg-warning-500/15 text-warning-200 ring-warning-400/25",
  danger: "bg-danger-500/15 text-danger-200 ring-danger-400/25",
  info: "bg-info-500/15 text-info-200 ring-info-400/25",
  violet: "bg-violet-500/15 text-violet-200 ring-violet-400/25",
};

const SIZE = {
  sm: "px-2 py-0.5", // inline, next to text (statuses, Required)
  md: "px-2 py-1", // on cards (step Complete / Pending)
};

type Props = {
  tone?: BadgeTone;
  size?: keyof typeof SIZE;
  // Layout only (width, alignment).
  className?: string;
  children: ReactNode;
};

/** A small uppercase status pill. */
export function Badge({ tone = "neutral", size = "sm", className = "", children }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full ${SIZE[size]} text-[10px] font-semibold uppercase tracking-wider ring-1 ${TONE[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
