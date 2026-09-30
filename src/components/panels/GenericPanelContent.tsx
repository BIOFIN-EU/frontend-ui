// components/panels/GenericPanelContent.tsx
import React from "react";
import { X, Info, Database, ExternalLink, BookOpen } from "lucide-react";

interface ScientificReference {
  dataset: string;
  organization: string;
  citation: string;
  url?: string;
  description: string;
}

interface GenericPanelContentProps {
  dataType: string;
  onClose: () => void;
  title?: string;
  description?: string;
  scientificReference?: ScientificReference;
}

export default function GenericPanelContent({
  dataType,
  onClose,
  title = "Detail Panel",
  description = "Detailed information will be displayed here.",
  scientificReference,
}: GenericPanelContentProps) {
  // Format the data type for display
  const formatDataType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between border-b border-fg/10 bg-shade/30 backdrop-blur-md p-5">
        <div>
          <p className="text-eyebrow tracking-[0.2em]">
            Detailed Information
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Info className="h-5 w-5 text-accent-400" />
            <h2 className="text-2xl font-semibold tracking-tight">
              {title}
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 hover:bg-fg/10 transition-colors ring-1 ring-fg/10"
        >
          <X className="h-5 w-5 text-fg/70" />
        </button>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-80px)] overflow-y-auto p-6 space-y-6 pb-32">
        {/* Data Type */}
        <div className="rounded-2xl surface-card p-4 ring-1 ring-fg/5">
          <p className="text-eyebrow tracking-wider">
            Data Type
          </p>
          <p className="mt-1 text-sm font-mono text-accent-300 break-all">
            {formatDataType(dataType)}
          </p>
        </div>

        {/* Description */}
        <div className="rounded-2xl surface-card p-5 ring-1 ring-fg/5">
          <h3 className="text-lg font-semibold text-accent-200 mb-3">
            Assessment Overview
          </h3>
          <p className="text-sm leading-relaxed text-fg/70">
            {description}
          </p>
        </div>

        {/* Scientific Reference */}
        {scientificReference && (
          <div className="rounded-2xl surface-card p-5 ring-1 ring-fg/5">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-accent-400" />
              <h3 className="text-lg font-semibold text-accent-200">
                Scientific Data Source
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-eyebrow tracking-wider mb-1">
                  Dataset
                </p>
                <p className="text-sm text-fg/80 font-medium">
                  {scientificReference.dataset}
                </p>
              </div>

              <div>
                <p className="text-eyebrow tracking-wider mb-1">
                  Provider
                </p>
                <p className="text-sm text-fg/70">
                  {scientificReference.organization}
                </p>
              </div>

              <div>
                <p className="text-eyebrow tracking-wider mb-2">
                  Description
                </p>
                <p className="text-sm text-fg/70 leading-relaxed">
                  {scientificReference.description}
                </p>
              </div>

              <div className="pt-3 border-t border-fg/10">
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-accent-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-eyebrow tracking-wider mb-1">
                      Citation
                    </p>
                    <p className="text-xs text-fg/60 leading-relaxed">
                      {scientificReference.citation}
                    </p>
                    {scientificReference.url && (
                      <a
                        href={scientificReference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-accent-400 hover:text-accent-300 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Access Dataset
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Technical Details */}
        <div className="rounded-2xl surface-card p-5 ring-1 ring-fg/5">
          <h3 className="text-lg font-semibold text-accent-200 mb-3">
            Methodology
          </h3>
          <p className="text-sm leading-relaxed text-fg/70">
            This assessment integrates spatial analysis of the selected geographic area against the referenced dataset. Results indicate the presence and extent of {formatDataType(dataType).toLowerCase()} within the region, contributing to the overall biodiversity risk and management recommendations.
          </p>
        </div>
      </div>
    </>
  );
}
