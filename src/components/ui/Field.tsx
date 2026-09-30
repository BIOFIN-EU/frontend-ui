import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

// Form inputs, selects and textareas: the one place their look is defined.
//
//   <Input /> or <input className={fieldClass()} />      compact (in-app forms)
//   <input className={fieldClass("roomy")} />           account and contact forms
//   <input className={fieldClass("step", { invalid })} /> workflow step forms
//
// Extra classes (height, font) can be appended.

export type FieldVariant = "compact" | "roomy" | "step";

const FIELD: Record<FieldVariant, string> = {
  compact: "w-full rounded-lg field px-3 py-2 text-sm text-fg outline-none placeholder:text-fg/30 focus:border-accent-400",
  roomy:
    "w-full rounded-xl surface-card px-4 py-3 text-sm text-fg placeholder:text-fg/35 ring-1 ring-fg/5 outline-none transition focus:border-accent-300/30 focus:ring-accent-300/20",
  step: "w-full rounded-xl border bg-shade/20 px-3 py-2 text-fg ring-1 ring-fg/5",
};

/**
 * Classes for a form input. `invalid` shows the error border (step forms);
 * `inline` sizes it to its content instead of the full width.
 */
export function fieldClass(
  variant: FieldVariant = "compact",
  options: { invalid?: boolean; inline?: boolean } = {}
): string {
  let classes = FIELD[variant];
  if (variant === "step") classes += options.invalid ? " border-danger-400/60" : " border-fg/10";
  return options.inline ? classes.replace("w-full ", "") : classes;
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { variant?: FieldVariant; invalid?: boolean };
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { variant?: FieldVariant; invalid?: boolean };

/** A text input in the theme's style. Works with react-hook-form's register(). */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant = "compact", invalid, className = "", ...props },
  ref
) {
  return <input ref={ref} className={`${fieldClass(variant, { invalid })} ${className}`.trim()} {...props} />;
});

/** A textarea in the theme's style. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { variant = "compact", invalid, className = "", ...props },
  ref
) {
  return <textarea ref={ref} className={`${fieldClass(variant, { invalid })} ${className}`.trim()} {...props} />;
});
