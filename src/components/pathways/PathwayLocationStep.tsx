"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { workflowService } from "@/services/workflow.service";
import type { WorkflowState, WorkflowStep } from "@/types/case-dashboard";
import type { CaseLocationEntry } from "@/types/workflow";
import RiskMap from "@/components/maps/RiskMap";
import { RequirementBadge } from "@/components/FormRenderer";
import type { PathwayStepMode } from "./PathwayStepScreen";

type Props = {
  state: WorkflowState;
  step: WorkflowStep;
  stepCode: string;
  mode?: PathwayStepMode;
  initialValues?: unknown;
  onStateUpdated: (state: WorkflowState) => void;
  onEditSaved?: () => void;
  onBack?: () => void;
  isFirstStep?: boolean;
};

type LocationType = "polygon" | "point";

type CountryDetectState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "resolved"; label: string }
  | { status: "error"; message: string };

type LocationEntry = {
  key: string;
  location_type: LocationType;
  friendly_name: string;
  notes: string;
  geometry_wkt: string;
  latitude: string;
  longitude: string;
  manualAreaHa: string;
  areaSqm: number | null;
  country: CountryDetectState;
};

let keyCounter = 0;

function createEmptyEntry(): LocationEntry {
  keyCounter += 1;
  return {
    key: `location-${keyCounter}`,
    location_type: "polygon",
    friendly_name: "",
    notes: "",
    geometry_wkt: "",
    latitude: "",
    longitude: "",
    manualAreaHa: "",
    areaSqm: null,
    country: { status: "idle" },
  };
}

function buildPointWkt(latitude: string, longitude: string): string {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (
    latitude.trim() === "" ||
    longitude.trim() === "" ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    return "";
  }

  return `POINT(${lon} ${lat})`;
}

function mapValueFor(entry: LocationEntry): string {
  return entry.location_type === "polygon"
    ? entry.geometry_wkt
    : buildPointWkt(entry.latitude, entry.longitude);
}

function hasGeometry(entry: LocationEntry): boolean {
  if (entry.location_type === "polygon") {
    return entry.geometry_wkt.trim().length > 0;
  }

  return entry.latitude.trim() !== "" && entry.longitude.trim() !== "";
}

// Builds a submit/edit/draft payload item from an entry. Draft callers pass
// entries as-is (no validity filtering), so lat/long/area gracefully become
// null instead of NaN when left blank.
function mapEntryToLocationPayload(entry: LocationEntry) {
  const friendly_name = entry.friendly_name.trim() || null;
  const notes = entry.notes.trim() || null;

  if (entry.location_type === "polygon") {
    return {
      friendly_name,
      location_type: "polygon" as const,
      geometry_wkt: entry.geometry_wkt,
      latitude: null,
      longitude: null,
      area_sqm: null,
      notes,
    };
  }

  const manualHa = entry.manualAreaHa.trim();
  const area_sqm =
    manualHa !== "" && !Number.isNaN(Number(manualHa))
      ? Number(manualHa) * 10000
      : null;

  const latitude =
    entry.latitude.trim() !== "" && !Number.isNaN(Number(entry.latitude))
      ? Number(entry.latitude)
      : null;

  const longitude =
    entry.longitude.trim() !== "" && !Number.isNaN(Number(entry.longitude))
      ? Number(entry.longitude)
      : null;

  return {
    friendly_name,
    location_type: "point" as const,
    geometry_wkt: null,
    latitude,
    longitude,
    area_sqm,
    notes,
  };
}

// Rehydrates a LocationEntry from either the committed shape returned by
// GET /data (CaseLocationEntry, with resolved country + area_hectares), or
// from a saved draft's raw shape (whatever mapEntryToLocationPayload wrote).
// The exact draft field names are a judgment call pending the backend's
// actual draft contract.
function toLocationEntry(raw: Record<string, unknown>): LocationEntry {
  keyCounter += 1;

  const location_type: LocationType =
    raw.location_type === "point" ? "point" : "polygon";

  const rawAreaSqm =
    typeof raw.area_sqm === "number" ? raw.area_sqm : null;
  const rawAreaHectares =
    typeof raw.area_hectares === "number" ? raw.area_hectares : null;
  const areaHectares =
    rawAreaHectares ?? (rawAreaSqm != null ? rawAreaSqm / 10000 : null);
  const isManualArea =
    typeof raw.area_is_manual === "boolean"
      ? raw.area_is_manual
      : location_type === "point";

  const country =
    raw.country && typeof raw.country === "object"
      ? (raw.country as { name?: string }).name
      : null;

  return {
    key: `location-${keyCounter}`,
    location_type,
    friendly_name: typeof raw.friendly_name === "string" ? raw.friendly_name : "",
    notes: typeof raw.notes === "string" ? raw.notes : "",
    geometry_wkt:
      location_type === "polygon" && typeof raw.geometry_wkt === "string"
        ? raw.geometry_wkt
        : "",
    latitude:
      location_type === "point" && raw.latitude != null ? String(raw.latitude) : "",
    longitude:
      location_type === "point" && raw.longitude != null ? String(raw.longitude) : "",
    manualAreaHa:
      location_type === "point" && isManualArea && areaHectares != null
        ? String(areaHectares)
        : "",
    areaSqm: location_type === "polygon" ? rawAreaSqm : null,
    country: country ? { status: "resolved", label: country } : { status: "idle" },
  };
}

function normalizeInitialEntries(initialValues: unknown): LocationEntry[] | null {
  if (!initialValues) return null;

  if (
    typeof initialValues === "object" &&
    !Array.isArray(initialValues) &&
    Array.isArray((initialValues as Record<string, unknown>).locations)
  ) {
    const raw = (initialValues as Record<string, unknown>).locations as unknown[];
    return raw
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .map(toLocationEntry);
  }

  if (Array.isArray(initialValues)) {
    return initialValues
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .map(toLocationEntry);
  }

  return null;
}

function formatArea(sqm: number | null): string {
  if (sqm === null || Number.isNaN(sqm)) return "—";
  const ha = sqm / 10000;
  return `${ha.toLocaleString(undefined, { maximumFractionDigits: 4 })} ha (${sqm.toLocaleString(undefined, { maximumFractionDigits: 1 })} sqm)`;
}

export function PathwayLocationStep({
  state,
  step,
  stepCode,
  mode = "submit",
  initialValues = null,
  onStateUpdated,
  onEditSaved,
  onBack,
  isFirstStep = true,
}: Props) {
  const isLast = !step.next;

  const [entries, setEntries] = useState<LocationEntry[]>(() => {
    const normalized = normalizeInitialEntries(initialValues);
    return normalized && normalized.length > 0 ? normalized : [createEmptyEntry()];
  });
  const [activeKey, setActiveKey] = useState<string>(entries[0].key);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");

  const detectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateEntry(key: string, patch: Partial<LocationEntry>) {
    setEntries((current) =>
      current.map((entry) => (entry.key === key ? { ...entry, ...patch } : entry))
    );
  }

  function addEntry() {
    const next = createEmptyEntry();
    setEntries((current) => [...current, next]);
    setActiveKey(next.key);
  }

  function removeEntry(key: string) {
    setEntries((current) => {
      if (current.length === 1) return current;
      const filtered = current.filter((entry) => entry.key !== key);

      if (activeKey === key) {
        setActiveKey(filtered[0]?.key ?? "");
      }

      return filtered;
    });
  }

  function setEntryMode(key: string, mode: LocationType) {
    updateEntry(key, {
      location_type: mode,
      geometry_wkt: "",
      latitude: "",
      longitude: "",
      manualAreaHa: "",
      areaSqm: null,
      country: { status: "idle" },
    });
    setActiveKey(key);
  }

  const activeEntry = entries.find((entry) => entry.key === activeKey) ?? entries[0];

  // Debounced country pre-detection for whichever card is currently active.
  const activeGeometrySignature = activeEntry
    ? `${activeEntry.location_type}|${activeEntry.geometry_wkt}|${activeEntry.latitude}|${activeEntry.longitude}`
    : "";

  useEffect(() => {
    if (detectTimerRef.current) {
      clearTimeout(detectTimerRef.current);
      detectTimerRef.current = null;
    }

    if (!activeEntry || !hasGeometry(activeEntry)) {
      return;
    }

    const key = activeEntry.key;
    const locationType = activeEntry.location_type;
    const geometryWkt = activeEntry.geometry_wkt;
    const latitude = activeEntry.latitude;
    const longitude = activeEntry.longitude;

    detectTimerRef.current = setTimeout(async () => {
      updateEntry(key, { country: { status: "loading" } });

      try {
        const result = await workflowService.detectCountry(
          locationType === "polygon"
            ? {
                location_type: "polygon",
                geometry_wkt: geometryWkt,
                latitude: null,
                longitude: null,
              }
            : {
                location_type: "point",
                geometry_wkt: null,
                latitude: Number(latitude),
                longitude: Number(longitude),
              }
        );

        updateEntry(key, {
          country: {
            status: "resolved",
            label: result.is_multiple
              ? "Multiple Countries"
              : result.country_name,
          },
        });
      } catch {
        updateEntry(key, {
          country: {
            status: "error",
            message: "Couldn't detect a country for this location yet.",
          },
        });
      }
    }, 500);

    return () => {
      if (detectTimerRef.current) {
        clearTimeout(detectTimerRef.current);
        detectTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, activeGeometrySignature]);

  const validEntries = useMemo(() => entries.filter(hasGeometry), [entries]);

  async function handleSubmit() {
    setError("");
    setFieldErrors({});

    if (validEntries.length === 0) {
      setError(
        "Please add at least one location with a polygon or a lat/long point."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const locations = validEntries.map(mapEntryToLocationPayload);

      if (mode === "edit") {
        await workflowService.editStep(state.case_id, stepCode, { locations });
        onEditSaved?.();
        return;
      }

      const updated = await workflowService.submitJsonStep(state.case_id, {
        locations,
      });

      onStateUpdated(updated);
    } catch (err: any) {
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    try {
      const locations = entries.map(mapEntryToLocationPayload);
      await workflowService.saveDraft(state.case_id, stepCode, { locations });
      setDraftMessage("Draft saved");
      setTimeout(() => setDraftMessage(""), 2000);
    } catch (err) {
      console.error("save draft failed", err);
    }
  }

  if (!activeEntry) {
    return <p className="text-sm text-white/70">No location step available.</p>;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">{step.title}</h2>
        <p className="mt-2 text-sm text-white/60">
          Draw one or more polygons, or drop lat/long points, to mark the
          locations for this project. Click a card to make it active on the
          map.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {fieldErrors.locations && (
        <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {fieldErrors.locations}
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry, index) => {
          const isActive = entry.key === activeEntry.key;

          return (
            <div
              key={entry.key}
              onClick={() => setActiveKey(entry.key)}
              className={[
                "rounded-xl border p-4 transition",
                isActive
                  ? "border-emerald-400/40 bg-emerald-500/5"
                  : "border-white/10 bg-black/20 hover:bg-white/[0.04]",
              ].join(" ")}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Location {index + 1}
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex overflow-hidden rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEntryMode(entry.key, "polygon");
                      }}
                      className={[
                        "px-3 py-1.5 text-xs font-semibold transition",
                        entry.location_type === "polygon"
                          ? "bg-emerald-400 text-emerald-950"
                          : "bg-transparent text-white/60 hover:bg-white/10",
                      ].join(" ")}
                    >
                      Polygon
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEntryMode(entry.key, "point");
                      }}
                      className={[
                        "px-3 py-1.5 text-xs font-semibold transition",
                        entry.location_type === "point"
                          ? "bg-emerald-400 text-emerald-950"
                          : "bg-transparent text-white/60 hover:bg-white/10",
                      ].join(" ")}
                    >
                      Lat/Long point
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEntry(entry.key);
                    }}
                    disabled={entries.length === 1}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <label className="block text-xs font-medium text-white/70">
                        Name
                      </label>
                      <RequirementBadge required={false} />
                    </div>
                    <input
                      value={entry.friendly_name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        updateEntry(entry.key, { friendly_name: e.target.value })
                      }
                      placeholder="e.g. North Field"
                      className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  {entry.location_type === "point" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <label className="block text-xs font-medium text-white/70">
                            Latitude
                          </label>
                          <RequirementBadge required={true} />
                        </div>
                        <input
                          type="number"
                          step="any"
                          value={entry.latitude}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={() => setActiveKey(entry.key)}
                          onChange={(e) =>
                            updateEntry(entry.key, { latitude: e.target.value })
                          }
                          placeholder="50.85"
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <label className="block text-xs font-medium text-white/70">
                            Longitude
                          </label>
                          <RequirementBadge required={true} />
                        </div>
                        <input
                          type="number"
                          step="any"
                          value={entry.longitude}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={() => setActiveKey(entry.key)}
                          onChange={(e) =>
                            updateEntry(entry.key, { longitude: e.target.value })
                          }
                          placeholder="4.35"
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <label className="block text-xs font-medium text-white/70">
                          Polygon WKT
                        </label>
                        <RequirementBadge required={true} />
                      </div>
                      <textarea
                        value={entry.geometry_wkt}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={() => setActiveKey(entry.key)}
                        onChange={(e) =>
                          updateEntry(entry.key, { geometry_wkt: e.target.value })
                        }
                        placeholder="Draw on the map, or paste/edit polygon WKT here"
                        className="min-h-24 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 font-mono text-xs text-white outline-none focus:border-emerald-400"
                      />
                    </div>
                  )}

                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <label className="block text-xs font-medium text-white/70">
                        Notes
                      </label>
                      <RequirementBadge required={false} />
                    </div>
                    <textarea
                      value={entry.notes}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        updateEntry(entry.key, { notes: e.target.value })
                      }
                      className="min-h-20 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-white/70">Country</p>
                      <p className="mt-1 text-sm text-white">
                        {entry.country.status === "loading" && "Detecting…"}
                        {entry.country.status === "resolved" &&
                          entry.country.label}
                        {entry.country.status === "error" &&
                          entry.country.message}
                        {entry.country.status === "idle" && "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-white/70">Area</p>
                      {entry.location_type === "polygon" ? (
                        <p className="mt-1 text-sm text-white">
                          {formatArea(entry.areaSqm)}
                        </p>
                      ) : (
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={entry.manualAreaHa}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            updateEntry(entry.key, {
                              manualAreaHa: e.target.value,
                            })
                          }
                          placeholder="Area (hectares, optional)"
                          className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  {isActive ? (
                    <RiskMap
                      polygonWkt={mapValueFor(entry)}
                      onPolygonWktChange={(wkt) =>
                        updateEntry(entry.key, { geometry_wkt: wkt })
                      }
                      mode={entry.location_type}
                      onPointChange={(lat, lon) =>
                        updateEntry(entry.key, {
                          latitude: String(lat),
                          longitude: String(lon),
                        })
                      }
                      onAreaChange={(sqm) =>
                        updateEntry(entry.key, { areaSqm: sqm })
                      }
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveKey(entry.key)}
                      className="flex h-[460px] w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-sm text-white/50 transition hover:bg-white/[0.04]"
                    >
                      Click to edit this location on the map
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl bg-white/8 px-4 py-2 text-sm text-white transition hover:bg-white/15"
            >
              Back
            </button>
          )}

          <button
            type="button"
            onClick={addEntry}
            className="rounded-xl border border-emerald-400/30 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/10"
          >
            Add another location
          </button>
        </div>

        <div className="flex items-center gap-3">
          {draftMessage && (
            <span className="text-xs font-medium text-emerald-300">
              {draftMessage}
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-xl bg-white/8 px-4 py-2 text-sm text-white transition hover:bg-white/15"
          >
            Save draft
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Submitting..."
              : mode === "edit"
                ? "Save changes"
                : isLast
                  ? "Finish"
                  : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
