import type { ElementType, ReactNode } from "react";

export type AlertTone = "danger" | "success" | "warning" | "info";

const TONE: Record<AlertTone, string> = {
  danger: "border-danger-400/30 bg-danger-500/10 text-danger-200",
  success: "border-accent-400/30 bg-accent-500/10 text-accent-100",
  warning: "border-warning-400/25 bg-warning-500/10 text-warning-100",
  info: "border-info-400/25 bg-info-500/10 text-info-100",
};

type Props = {
  tone?: AlertTone;
  // Rendered element, e.g. "p", or "label" for a confirmation checkbox.
  as?: ElementType;
  // Layout only (margins, flex); the look comes from the tone.
  className?: string;
  role?: string;
  children: ReactNode;
};

/** A message box: errors, confirmations, warnings. */
export function Alert({ tone = "danger", as: Tag = "div", className = "", role, children }: Props) {
  return (
    <Tag
      role={role ?? (tone === "danger" ? "alert" : "status")}
      className={`rounded-xl border px-4 py-3 text-sm ${TONE[tone]} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
