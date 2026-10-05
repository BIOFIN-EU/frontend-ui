"use client";

import { Listbox } from "@headlessui/react";
import { ChevronsUpDown } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
} from "react";
import { createPortal } from "react-dom";

type Option = {
  label: string;
  value: string;
  // Options with a group are listed under its heading (keep a group's
  // options adjacent).
  groupLabel?: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  // Shown when nothing is chosen.
  placeholder?: string;
  disabled?: boolean;
};

// Hooks can't run inside Listbox's render-prop callback, so the "reposition
// when opened" effect lives in this child, rendered from that callback.
function RepositionOnOpen({ open, reposition }: { open: boolean; reposition: () => void }) {
  useLayoutEffect(() => {
    if (open) reposition();
    // Only re-run when the listbox opens; reposition is recreated every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return null;
}

export function Select({ value, onChange, options, placeholder = "Select...", disabled = false }: Props) {
  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const optionsRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  function updatePosition() {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const gap = 8;
    const viewportPadding = 12;
    const estimatedHeight = 240;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

    setPanelStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      top: openUp ? undefined : rect.bottom + gap,
      bottom: openUp ? window.innerHeight - rect.top + gap : undefined,
      zIndex: 9999,
    });
  }

  useLayoutEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, []);

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => {
        return (
          <>
            <RepositionOnOpen open={open} reposition={updatePosition} />
            <div className="relative">
              <Listbox.Button
                ref={buttonRef}
                className={`w-full rounded-xl surface-card px-4 py-3 text-left text-sm outline-none ${
                  disabled ? "cursor-not-allowed text-fg/40" : "text-fg"
                }`}
              >
                <span>{selected?.label || placeholder}</span>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
                  <ChevronsUpDown className="h-5 w-5" strokeWidth={1.75} />
                </span>
              </Listbox.Button>
            </div>

            {mounted && open
              ? createPortal(
                  <Listbox.Options
                    static
                    as="div"
                    ref={optionsRef}
                    style={panelStyle}
                    className="max-h-60 overflow-auto rounded-xl border border-fg/10 bg-popover p-1 shadow-2xl ring-1 ring-shade/40 focus:outline-none"
                  >
                    {options.map((opt, index) => (
                      <Fragment key={opt.value}>
                      {opt.groupLabel && opt.groupLabel !== options[index - 1]?.groupLabel && (
                        <div className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-fg/45">
                          {opt.groupLabel}
                        </div>
                      )}
                      <Listbox.Option value={opt.value} as={Fragment}>
                        {({ focus, selected }) => (
                          <div
                            className={`cursor-pointer rounded-lg px-4 py-3 text-sm ${
                              focus ? "bg-fg/10 text-fg" : "text-fg/80"
                            } ${selected ? "font-semibold" : ""}`}
                          >
                            {opt.label}
                          </div>
                        )}
                      </Listbox.Option>
                      </Fragment>
                    ))}
                  </Listbox.Options>,
                  document.body
                )
              : null}
          </>
        );
      }}
    </Listbox>
  );
}