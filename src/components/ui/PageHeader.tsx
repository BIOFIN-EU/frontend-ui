import type { ReactNode } from "react";

type Props = {
  // Small label above the title ("PROJECTS"), or any node (e.g. a tag).
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  // Buttons on the right.
  actions?: ReactNode;
  // lg: account pages (login, profile).
  size?: "md" | "lg";
  // Extra lines under the subtitle.
  children?: ReactNode;
  className?: string;
};

/** A page's title block: eyebrow, title, subtitle and actions. */
export function PageHeader({ eyebrow, title, subtitle, actions, size = "md", children, className = "" }: Props) {
  return (
    <header className={`flex flex-wrap items-start justify-between gap-4 ${className}`.trim()}>
      <div className="space-y-2">
        {typeof eyebrow === "string" ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-200/70">{eyebrow}</p>
        ) : (
          eyebrow
        )}
        <h1 className={`${size === "lg" ? "text-4xl" : "text-3xl"} font-semibold tracking-tight text-fg`}>{title}</h1>
        {subtitle && <p className="max-w-3xl text-sm leading-6 text-fg/70">{subtitle}</p>}
        {children}
      </div>
      {actions}
    </header>
  );
}
