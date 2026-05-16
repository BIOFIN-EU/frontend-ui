// components/panels/SpeciesRichnessPanel.tsx
import React from "react";
import { X, Trees, BookOpen, Link as LinkIcon } from "lucide-react";

interface SpeciesRichnessPanelProps {
  dataType: string;
  onClose: () => void;
  caseData?: {
    sri_logic_type: string;
    sri_correction_method: string;
    sri: string;
    sri_species_list: string;
    country_code: string;
  };
  species?: string[];
}

function formatSpeciesList(speciesList: string): string[] {
  return speciesList
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function SpeciesRichnessPanel({
  dataType,
  onClose,
  caseData,
  species,
}: SpeciesRichnessPanelProps) {
  const speciesList = species ?? (caseData?.sri_species_list ? formatSpeciesList(caseData.sri_species_list) : []);

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-md p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
            Biodiversity Indicator
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Trees className="h-5 w-5 text-emerald-400" />
            <h2 className="text-2xl font-semibold tracking-tight">
              Species Richness Index (SRI)
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
        {/* SRI Overview */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
          <h3 className="text-lg font-semibold text-emerald-200 mb-3">
            Species Richness Index
          </h3>
          <p className="text-sm leading-relaxed text-white/70 mb-4">
            The Species Richness Index (SRI) quantifies biodiversity potential within a given region based on the presence of indicator species, and a suitable climate and elevation for its habitat. This index has been corrected using the Human Footprint Index (HFI) to account for anthropogenic pressures, providing a more accurate assessment of actual biodiversity conservation value.
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            SRI values incorporate fuzzy logic modeling to account for species occurrence probabilities and habitat suitability, resulting in a continuous spectrum of biodiversity richness rather than binary classifications.
          </p>
        </div>

        {/* Model Configuration */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
          <h3 className="text-lg font-semibold text-emerald-200 mb-3">
            Model Configuration
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-white/45">SRI Logic Type</p>
              <p className="text-white/80 font-medium capitalize">{caseData?.sri_logic_type}</p>
            </div>
            <div>
              <p className="text-xs text-white/45">Correction Method</p>
              <p className="text-white/80 font-medium uppercase">{caseData?.sri_correction_method ?? "HFI"}</p>
            </div>
            <div>
              <p className="text-xs text-white/45">Country Code</p>
              <p className="text-white/80 font-medium">{caseData?.country_code}</p>
            </div>
            <div>
              <p className="text-xs text-white/45">SRI Raw Data</p>
              <p className="text-white/80 font-medium text-xs break-all">{caseData?.sri}</p>
            </div>
          </div>
        </div>

        {/* Methodology Reference */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-emerald-200">
              Methodology & Reference
            </h3>
            <BookOpen className="h-4 w-4 text-white/40" />
          </div>
          <p className="text-sm leading-relaxed text-white/70 mb-3">
            The SRI is calculated based on established indicator species frameworks for habitat-specific biodiversity assessment. The methodology integrates species distribution modeling, with source data retrieved from GBIF(Global Biodiversity Information Facility), and using ensemble model for the calculation.
          </p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add proper link when available
              console.log("Link to reference paper - to be updated");
            }}
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>Siham et al. Year - Reference here</span>
          </a>
        </div>

        {/* Species List */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Trees className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-emerald-200">
              Indicator Species List
            </h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            {speciesList.length} species identified as biodiversity indicators for this region:
          </p>
          <div className="max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-4">
            <ul className="space-y-2 text-sm text-white/70">
              {speciesList.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span className="italic">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
