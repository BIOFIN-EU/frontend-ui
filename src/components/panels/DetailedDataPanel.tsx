// components/panels/DetailedDataPanel.tsx
import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DetailedDataPanelProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: string;
}

export default function DetailedDataPanel({
  isOpen,
  onClose,
  dataType,
}: DetailedDataPanelProps) {
  // Handle escape key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-40"
        onClick={onClose}
      />

      {/* Right side panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-1/2 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_25%),linear-gradient(180deg,#07111a_0%,#09131d_100%)] text-white shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-white/10">
        {/* Header with close button */}
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-md p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Detailed Information
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Detail Panel
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/10 transition-colors ring-1 ring-white/10"
            aria-label="Close panel"
          >
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        {/* Panel content */}
        <div className="h-[calc(100%-80px)] overflow-y-auto p-6 space-y-6">
          {/* Data type indicator */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
              Data Type
            </p>
            <p className="mt-1 text-sm font-mono text-emerald-300 break-all">
              {dataType}
            </p>
          </div>

          {/* Section 1 */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
            <h3 className="text-lg font-semibold text-emerald-200 mb-3">
              Section Title 1
            </h3>
            <p className="text-sm leading-relaxed text-white/70">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>

          {/* Section 2 */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
            <h3 className="text-lg font-semibold text-emerald-200 mb-3">
              Section Title 2
            </h3>
            <p className="text-sm leading-relaxed text-white/70">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
