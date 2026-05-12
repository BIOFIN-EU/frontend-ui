// components/panels/GenericPanelContent.tsx
import React from "react";
import { X, Info } from "lucide-react";

interface GenericPanelContentProps {
  dataType: string;
  onClose: () => void;
}

export default function GenericPanelContent({
  dataType,
  onClose,
}: GenericPanelContentProps) {
  return (
    <>
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-md p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
            Detailed Information
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Info className="h-5 w-5 text-emerald-400" />
            <h2 className="text-2xl font-semibold tracking-tight">
              Detail Panel
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 hover:bg-white/10 transition-colors ring-1 ring-white/10"
        >
          <X className="h-5 w-5 text-white/70" />
        </button>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-80px)] overflow-y-auto p-6 space-y-6 pb-32">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
            Data Type
          </p>
          <p className="mt-1 text-sm font-mono text-emerald-300 break-all">
            {dataType}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
          <h3 className="text-lg font-semibold text-emerald-200 mb-3">
            Information
          </h3>
          <p className="text-sm leading-relaxed text-white/70">
            Detailed information for {dataType} will be displayed here. This is a generic panel for data types that don't have a specialized view yet.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
          <h3 className="text-lg font-semibold text-emerald-200 mb-3">
            Technical Details
          </h3>
          <p className="text-sm leading-relaxed text-white/70">
            Additional technical metadata and analysis results will appear here as they become available.
          </p>
        </div>
      </div>
    </>
  );
}
