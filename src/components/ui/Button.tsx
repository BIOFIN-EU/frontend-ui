import type { ButtonHTMLAttributes } from "react";

// Buttons: the one place their look is defined (styles and <Button>). Colours come from the
// theme (src/styles/theme.css).
//
//   <Button variant="primary">Save</Button>
//   <Link className={buttonClass("secondary")} ... />     links styled as buttons
//   buttonClass("ghost", "sm")                            compact, for rows and cards
//
// `!text-…` beats globals.css's `a { color: inherit }` on links.

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-soft";
export type ButtonSize = "md" | "sm";

const SIZE: Record<ButtonSize, string> = {
  md: "inline-flex min-h-[48px] items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition duration-200",
  // Compact sizing for dense contexts (table rows, cards).
  sm: "inline-flex min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold transition duration-200",
};

const VARIANT: Record<ButtonVariant, string> = {
  primary: "border border-accent-300 bg-accent-400/15 !text-fg hover:bg-accent-300 hover:!text-on-solid",
  secondary: "border border-fg/30 bg-transparent !text-fg hover:bg-fg/10",
  // Lower-emphasis actions (Cancel, Back, Save draft).
  ghost: "border border-fg/10 bg-fg/10 !text-fg hover:bg-fg/20",
  danger: "border border-danger-400 bg-danger-500 !text-on-solid hover:bg-danger-400",
  // Destructive but not the main action (Delete in a list or menu).
  "danger-soft": "border border-danger-400/30 bg-danger-500/10 !text-danger-200 hover:bg-danger-500/20",
};

/** Classes for a button (or a link that looks like one). No variant: size only. */
export function buttonClass(variant?: ButtonVariant, size: ButtonSize = "md"): string {
  return variant ? `${SIZE[size]} ${VARIANT[variant]}` : SIZE[size];
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** A button in one of the theme's variants. Extra classes (layout) go in className. */
export function Button({ variant = "primary", size = "md", type = "button", className = "", ...props }: Props) {
  return <button type={type} className={`${buttonClass(variant, size)} ${className}`.trim()} {...props} />;
}
