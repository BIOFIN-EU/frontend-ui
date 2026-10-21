// Looks used only on the home page, so the page can be restyled (or undone)
// without touching the shared Button styles.

// A solid green button for the page's main actions. accent-700 is the same in
// both themes and keeps white text readable on it.
export const solidButton =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-accent-600 bg-accent-700 px-5 py-3 text-sm font-semibold !text-on-solid shadow-panel-soft transition duration-200 hover:bg-accent-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60";

// Icon in a tinted circle.
export const iconCircle =
  "flex shrink-0 items-center justify-center rounded-full bg-accent-400/15 text-accent-300 ring-1 ring-accent-400/25";
