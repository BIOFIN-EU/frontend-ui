// components/panels/DetailedDataPanel.tsx - Keep it simple and generic
import React from "react";

interface DetailedDataPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function DetailedDataPanel({
  isOpen,
  onClose,
  children,
}: DetailedDataPanelProps) {
  // Handle escape key press
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
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
        {/* "Go Back" button on the left edge of the panel */}
        <button
          onClick={onClose}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full flex items-center gap-3 text-white/70 hover:text-white transition-colors duration-200 cursor-pointer px-4 py-3"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="text-base font-medium hidden sm:block whitespace-nowrap">Go Back</span>
        </button>

        {children}
      </div>
    </>
  );
}
