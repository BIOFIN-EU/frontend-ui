// components/panels/DetailedDataPanel.tsx - Keep it simple and generic
import React from "react";
import { createPortal } from "react-dom";

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

  // Portalled to <body> so it layers above the sticky site header; inside
  // <main> (z-10) the header (z-20) would cover the panel's top.
  return createPortal(
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-shade/50 backdrop-blur-sm transition-opacity z-40"
        onClick={onClose}
      />

      {/* Right side panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-1/2 bg-data-panel text-fg shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-fg/10">
        {/* "Go Back" button on the left edge of the panel */}
        <button
          type="button"
          aria-label="Close data panel"
          onClick={onClose}
          className="absolute bottom-4 left-4 z-10 min-h-11 rounded-xl bg-popover shadow-overlay sm:bottom-auto sm:left-0 sm:top-1/2 sm:-translate-y-1/2 sm:-translate-x-full sm:bg-transparent sm:shadow-none flex items-center gap-3 text-fg/70 hover:text-fg transition-colors duration-200 cursor-pointer px-4 py-3"
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
    </>,
    document.body
  );
}
