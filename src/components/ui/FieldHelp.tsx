"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Info } from "lucide-react";

type DescribedOption = {
  label: string;
  description?: string | null;
};

type Props = {
  // The field's help_text from physical-api's workflow config.
  text?: string | null;
  // The field's name, for the button's accessible label.
  label: string;
  // Dropdown options to explain (fields with describe_options). Only those
  // with a description are listed.
  options?: DescribedOption[];
};

/**
 * An ⓘ button next to a field label that opens a short explanation of the
 * field and, for some dropdowns, what each option means. Renders nothing
 * when there is nothing to explain.
 */
export function FieldHelp({ text, label, options }: Props) {
  const described = (options ?? []).filter((option) => option.description);

  if (!text && described.length === 0) return null;

  return (
    <Popover className="inline-flex">
      <PopoverButton
        type="button"
        aria-label={`About ${label}`}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white/50 transition hover:text-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </PopoverButton>

      <PopoverPanel
        anchor={{ to: "bottom start", gap: 6 }}
        className="z-[950] max-h-80 w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-white/10 bg-[#0b1a22] p-3 text-sm font-normal leading-6 text-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
      >
        {text && <p>{text}</p>}

        {described.length > 0 && (
          <dl className={`space-y-2 ${text ? "mt-3 border-t border-white/10 pt-3" : ""}`}>
            {described.map((option) => (
              <div key={option.label}>
                <dt className="font-semibold text-white">{option.label}</dt>
                <dd className="text-white/70">{option.description}</dd>
              </div>
            ))}
          </dl>
        )}
      </PopoverPanel>
    </Popover>
  );
}
