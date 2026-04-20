"use client";

import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
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
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
};

export function Select({ value, onChange, options }: Props) {
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
    <Listbox value={value} onChange={onChange}>
      {({ open }) => {
        useLayoutEffect(() => {
          if (open) updatePosition();
        }, [open]);

        return (
          <>
            <div className="relative">
              <Listbox.Button
                ref={buttonRef}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white outline-none"
              >
                <span>{selected?.label || "Select..."}</span>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
                  <ChevronUpDownIcon className="h-5 w-5" />
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
                    className="max-h-60 overflow-auto rounded-xl border border-white/10 bg-[#0b1220] p-1 shadow-2xl ring-1 ring-black/40 focus:outline-none"
                  >
                    {options.map((opt) => (
                      <Listbox.Option key={opt.value} value={opt.value} as={Fragment}>
                        {({ focus, selected }) => (
                          <div
                            className={`cursor-pointer rounded-lg px-4 py-3 text-sm ${
                              focus ? "bg-white/10 text-white" : "text-white/80"
                            } ${selected ? "font-semibold" : ""}`}
                          >
                            {opt.label}
                          </div>
                        )}
                      </Listbox.Option>
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