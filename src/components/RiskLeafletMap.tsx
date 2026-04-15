"use client";

import { useMemo, useRef } from "react";
import L, { type LatLngExpression } from "leaflet";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polygon,
  FeatureGroup,
  useMapEvents,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

type Mode = "point" | "polygon";
type Point = { x: number; y: number };

type Props = {
  mode: Mode;
  points: Point[];
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
};

const EUROPE_BOUNDS = {
  minLon: -12,
  maxLon: 35,
  minLat: 34,
  maxLat: 72,
};

function pointToLatLng(point: Point): [number, number] {
  const lng =
    EUROPE_BOUNDS.minLon +
    (point.x / 700) * (EUROPE_BOUNDS.maxLon - EUROPE_BOUNDS.minLon);

  const lat =
    EUROPE_BOUNDS.maxLat -
    (point.y / 360) * (EUROPE_BOUNDS.maxLat - EUROPE_BOUNDS.minLat);

  return [lat, lng];
}

function latLngToPoint(lat: number, lng: number): Point {
  const x =
    ((lng - EUROPE_BOUNDS.minLon) /
      (EUROPE_BOUNDS.maxLon - EUROPE_BOUNDS.minLon)) *
    700;

  const y =
    ((EUROPE_BOUNDS.maxLat - lat) /
      (EUROPE_BOUNDS.maxLat - EUROPE_BOUNDS.minLat)) *
    360;

  return { x, y };
}

function MapClickHandler({
  mode,
  setPoints,
}: {
  mode: Mode;
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
}) {
  useMapEvents({
    click(e) {
      if (mode !== "point") return;
      setPoints([latLngToPoint(e.latlng.lat, e.latlng.lng)]);
    },
  });

  return null;
}

export default function RiskLeafletMap({
  mode,
  points,
  setPoints,
}: Props) {
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const polygonPositions = useMemo(
    () => points.map(pointToLatLng) as LatLngExpression[],
    [points]
  );

  const markerPosition = useMemo(() => {
    if (!points.length) return null;
    return pointToLatLng(points[0]);
  }, [points]);

  const hasPolygon = mode === "polygon" && points.length >= 3;

  return (
    <div className="relative h-[460px] w-full">
      <MapContainer
        center={[54, 15]}
        zoom={4}
        minZoom={3}
        maxZoom={8}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler mode={mode} setPoints={setPoints} />

        {mode === "point" && markerPosition && (
          <CircleMarker
            center={markerPosition}
            radius={10}
            pathOptions={{
              color: "#6ee7b7",
              weight: 2,
              fillColor: "#6ee7b7",
              fillOpacity: 0.35,
            }}
          />
        )}

        {mode === "polygon" && hasPolygon && (
          <Polygon
            positions={polygonPositions}
            pathOptions={{
              color: "#6ee7b7",
              weight: 3,
              fillColor: "#34d399",
              fillOpacity: 0.2,
            }}
          />
        )}

        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon:
                mode === "polygon"
                  ? {
                      allowIntersection: false,
                      showArea: true,
                      shapeOptions: {
                        color: "#6ee7b7",
                        weight: 3,
                      },
                    }
                  : false,
            }}
            edit={{
              edit: false,
              remove: mode === "polygon",
            }}
            onCreated={(e) => {
              if (e.layerType !== "polygon") return;

              const layer = e.layer as L.Polygon;
              const latLngs = (layer.getLatLngs()[0] as L.LatLng[]) ?? [];

              const nextPoints = latLngs.map((latLng) =>
                latLngToPoint(latLng.lat, latLng.lng)
              );

              setPoints(nextPoints);

              if (featureGroupRef.current) {
                featureGroupRef.current.clearLayers();
              }
            }}
            onDeleted={() => {
              setPoints([]);
            }}
          />
        </FeatureGroup>
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
        <p className="text-sm font-semibold text-white">Europe risk map</p>
        <p className="mt-1 text-xs text-white/70">
          {mode === "point"
            ? "Click the map to place a site point."
            : "Use the polygon tool to draw an area."}
        </p>
      </div>
    </div>
  );
}