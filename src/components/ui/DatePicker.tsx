"use client";

import { useEffect, useMemo, useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

// Dates are stored as ISO "YYYY-MM-DD" and shown / typed as dd/mm/yyyy,
// whatever the browser's locale (a native date input follows the locale,
// e.g. mm/dd/yyyy in a US-English browser).

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function isRealDate(year: number, month: number, day: number) {
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}

/** "2027-01-15" -> "15/01/2027"; anything else is returned unchanged. */
export function isoToDisplay(value: string | null | undefined): string {
  const match = ISO.exec(value ?? "");
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value ?? "";
}

/** "15/1/2027" or "15-01-2027" -> "2027-01-15"; null when it isn't a real date. */
export function displayToIso(text: string): string | null {
  const match = /^\s*(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\s*$/.exec(text);
  if (!match) return null;
  const [day, month, year] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  return isRealDate(year, month, day) ? toIso(year, month, day) : null;
}

type Props = {
  id?: string;
  value: string | null | undefined;
  onChange: (iso: string) => void;
  invalid?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function DatePicker({ id, value, onChange, invalid, className = "", ...rest }: Props) {
  const [text, setText] = useState(isoToDisplay(value));
  const [typingError, setTypingError] = useState(false);

  useEffect(() => {
    setText(isoToDisplay(value));
    setTypingError(false);
  }, [value]);

  function commit() {
    if (!text.trim()) {
      setTypingError(false);
      if (value) onChange("");
      return;
    }
    const iso = displayToIso(text);
    if (iso) {
      setTypingError(false);
      setText(isoToDisplay(iso));
      if (iso !== value) onChange(iso);
    } else {
      setTypingError(true);
    }
  }

  const showError = invalid || typingError;

  return (
    <div className={className}>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/yyyy"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          aria-invalid={showError || undefined}
          aria-label={rest["aria-label"]}
          className={`w-full rounded-xl border bg-shade/20 py-2 pl-3 pr-10 text-fg ring-1 ring-fg/5 outline-none placeholder:text-fg/30 focus:border-accent-400 ${
            showError ? "border-danger-400/60" : "border-fg/10"
          }`}
        />
        <Popover className="absolute inset-y-0 right-0 flex items-center pr-1.5">
          <PopoverButton
            aria-label="Choose a date"
            className="rounded-lg p-1.5 text-fg/60 transition hover:bg-fg/10 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
          </PopoverButton>
          <PopoverPanel
            anchor={{ to: "bottom end", gap: 6 }}
            className="z-50 w-72 rounded-2xl field p-3 shadow-overlay"
          >
            {({ close }) => (
              <Calendar
                value={ISO.test(value ?? "") ? (value as string) : null}
                onPick={(iso) => {
                  onChange(iso);
                  close();
                }}
              />
            )}
          </PopoverPanel>
        </Popover>
      </div>
      {typingError && <p className="mt-1 text-sm text-danger-300">Enter a date as dd/mm/yyyy.</p>}
    </div>
  );
}

function Calendar({ value, onPick }: { value: string | null; onPick: (iso: string) => void }) {
  const today = new Date();
  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate());
  const initial = value ? ISO.exec(value)! : null;
  const [year, setYear] = useState(initial ? Number(initial[1]) : today.getFullYear());
  const [month, setMonth] = useState(initial ? Number(initial[2]) - 1 : today.getMonth());

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7; // Monday first
    const days = new Date(year, month + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  }, [year, month]);

  function shift(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  return (
    <div className="text-sm text-fg">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="rounded-lg p-1.5 hover:bg-fg/10">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-1">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            aria-label="Month"
            className="rounded-lg bg-fg/5 px-1.5 py-1 text-sm text-fg outline-none"
          >
            {MONTHS.map((name, index) => (
              <option key={name} value={index} className="bg-field-2">
                {name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (next >= 1900 && next <= 2200) setYear(next);
            }}
            aria-label="Year"
            className="w-20 rounded-lg bg-fg/5 px-1.5 py-1 text-sm text-fg outline-none"
          />
        </div>
        <button type="button" onClick={() => shift(1)} aria-label="Next month" className="rounded-lg p-1.5 hover:bg-fg/10">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1 text-[11px] font-semibold uppercase text-fg/45">
            {day}
          </span>
        ))}
        {cells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />;
          const iso = toIso(year, month, day);
          const selected = iso === value;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onPick(iso)}
              aria-label={isoToDisplay(iso)}
              aria-pressed={selected}
              className={[
                "rounded-lg py-1.5 tabular-nums transition",
                selected
                  ? "bg-accent-500 font-semibold text-slate-950"
                  : iso === todayIso
                    ? "text-accent-200 ring-1 ring-accent-400/50 hover:bg-fg/10"
                    : "text-fg/85 hover:bg-fg/10",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between border-t border-fg/10 pt-2">
        <button type="button" onClick={() => onPick(todayIso)} className="rounded-lg px-2 py-1 text-xs font-semibold text-accent-200 hover:bg-fg/10">
          Today
        </button>
        {value && (
          <button type="button" onClick={() => onPick("")} className="rounded-lg px-2 py-1 text-xs font-semibold text-fg/60 hover:bg-fg/10">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
