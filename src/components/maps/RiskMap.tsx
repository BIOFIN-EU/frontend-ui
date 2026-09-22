"use client";

import { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Draw, { type DrawEvent } from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Select from "ol/interaction/Select";
import { click } from "ol/events/condition";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import WKT from "ol/format/WKT";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat } from "ol/proj";
import { area as turfArea } from "@turf/turf";
import type Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";

type DrawMode = "polygon" | "point";

type Props = {
  polygonWkt: string;
  onPolygonWktChange?: (wkt: string) => void;
  mode?: DrawMode;
  onPointChange?: (lat: number, lon: number) => void;
  onAreaChange?: (sqm: number) => void;
  readOnly?: boolean;
  heightClassName?: string;
};

const wktFormat = new WKT();
const geoJsonFormat = new GeoJSON();

function featureToWkt(feature: Feature<Geometry>) {
  const cloned = feature.clone();
  cloned.getGeometry()?.transform("EPSG:3857", "EPSG:4326");
  return wktFormat.writeFeature(cloned);
}

function wktToFeature(wkt: string) {
  const feature = wktFormat.readFeature(wkt, {
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
  });

  return feature as Feature<Geometry>;
}

function featureStyle(feature: Feature<Geometry> | undefined) {
  if (feature?.getGeometry()?.getType() === "Point") {
    return new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color: "#34d399" }),
        stroke: new Stroke({ color: "#065f46", width: 2 }),
      }),
    });
  }

  return new Style({
    stroke: new Stroke({
      color: "#6ee7b7",
      width: 3,
    }),
    fill: new Fill({
      color: "rgba(52, 211, 153, 0.2)",
    }),
  });
}

function computeAreaSqm(feature: Feature<Geometry>): number {
  const geojson = geoJsonFormat.writeFeatureObject(feature, {
    featureProjection: "EPSG:3857",
    dataProjection: "EPSG:4326",
  });

  return turfArea(geojson as any);
}

export default function RiskMap({
  polygonWkt,
  onPolygonWktChange,
  mode = "polygon",
  onPointChange,
  onAreaChange,
  readOnly = false,
  heightClassName = "h-[460px]",
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const selectRef = useRef<Select | null>(null);
  const modifyRef = useRef<Modify | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const isSyncingFromPropRef = useRef(false);
  const modeRef = useRef<DrawMode>(mode);

  const onPolygonWktChangeRef = useRef<Props["onPolygonWktChange"]>(onPolygonWktChange);
  const onPointChangeRef = useRef<Props["onPointChange"]>(onPointChange);
  const onAreaChangeRef = useRef<Props["onAreaChange"]>(onAreaChange);

  useEffect(() => {
    onPolygonWktChangeRef.current = onPolygonWktChange;
  }, [onPolygonWktChange]);

  useEffect(() => {
    onPointChangeRef.current = onPointChange;
  }, [onPointChange]);

  useEffect(() => {
    onAreaChangeRef.current = onAreaChange;
  }, [onAreaChange]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Map + non-drawing interactions: created once per component instance.
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => featureStyle(feature as Feature<Geometry>),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      view: new View({
        center: fromLonLat([15, 50]),
        zoom: 4,
      }),
    });

    mapInstanceRef.current = map;

    if (readOnly) {
      return () => {
        map.setTarget(undefined);
        mapInstanceRef.current = null;
        vectorSourceRef.current = null;
      };
    }

    const modify = new Modify({
      source: vectorSource,
    });

    const select = new Select({
      condition: click,
    });

    selectRef.current = select;
    modifyRef.current = modify;

    map.addInteraction(modify);
    map.addInteraction(select);

    modify.on("modifyend", (event) => {
      const features = event.features.getArray();
      if (!features.length) {
        onPolygonWktChangeRef.current?.("");
        return;
      }

      const feature = features[0] as Feature<Geometry>;

      if (modeRef.current === "point") {
        const geometry = feature.getGeometry();
        if (!geometry) return;

        const geojson = geoJsonFormat.writeGeometryObject(geometry, {
          featureProjection: "EPSG:3857",
          dataProjection: "EPSG:4326",
        }) as any;

        const [lon, lat] = geojson.coordinates as [number, number];
        onPointChangeRef.current?.(lat, lon);
      } else {
        const wkt = featureToWkt(feature);
        onPolygonWktChangeRef.current?.(wkt);
        onAreaChangeRef.current?.(computeAreaSqm(feature));
      }
    });

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete") return;

      const selected = select.getFeatures();
      selected.forEach((feature) => vectorSource.removeFeature(feature));
      selected.clear();
      onPolygonWktChangeRef.current?.("");
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      map.setTarget(undefined);
      mapInstanceRef.current = null;
      vectorSourceRef.current = null;
      selectRef.current = null;
      modifyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw interaction: recreated whenever the draw mode changes so the
  // correct geometry type ("Point" vs "Polygon") is drawn.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const vectorSource = vectorSourceRef.current;
    const select = selectRef.current;

    if (!map || !vectorSource || readOnly) return;

    if (drawRef.current) {
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    const draw = new Draw({
      source: vectorSource,
      type: mode === "point" ? "Point" : "Polygon",
    });

    draw.on("drawstart", () => {
      isSyncingFromPropRef.current = true;
      vectorSource.clear();
      select?.getFeatures().clear();
      isSyncingFromPropRef.current = false;

      if (mode !== "point") {
        onPolygonWktChangeRef.current?.("");
      }
    });

    draw.on("drawend", (event: DrawEvent) => {
      const feature = event.feature as Feature<Geometry>;

      if (mode === "point") {
        const geometry = feature.getGeometry();
        if (!geometry) return;

        const geojson = geoJsonFormat.writeGeometryObject(geometry, {
          featureProjection: "EPSG:3857",
          dataProjection: "EPSG:4326",
        }) as any;

        const [lon, lat] = geojson.coordinates as [number, number];
        onPointChangeRef.current?.(lat, lon);
      } else {
        const wkt = featureToWkt(feature);
        onPolygonWktChangeRef.current?.(wkt);
        onAreaChangeRef.current?.(computeAreaSqm(feature));
      }
    });

    map.addInteraction(draw);
    drawRef.current = draw;

    return () => {
      map.removeInteraction(draw);
    };
  }, [mode, readOnly]);

  // Sync the map from the controlled `polygonWkt` (or point WKT) prop.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const vectorSource = vectorSourceRef.current;
    const select = selectRef.current;

    if (!map || !vectorSource) return;
    if (isSyncingFromPropRef.current) return;

    const existingFeatures = vectorSource.getFeatures();
    const existingWkt =
      existingFeatures.length > 0
        ? featureToWkt(existingFeatures[0] as Feature<Geometry>)
        : "";

    if ((polygonWkt || "") === existingWkt) {
      return;
    }

    isSyncingFromPropRef.current = true;

    try {
      vectorSource.clear();
      select?.getFeatures().clear();

      if (!polygonWkt.trim()) {
        return;
      }

      const feature = wktToFeature(polygonWkt);
      vectorSource.addFeature(feature);

      const geometry = feature.getGeometry();
      if (geometry) {
        map.getView().fit(geometry.getExtent(), {
          padding: [40, 40, 40, 40],
          maxZoom: 16,
          duration: 250,
        });
      }
    } catch {
      // Ignore invalid/incomplete WKT while the user is typing.
      // The textarea can temporarily contain invalid text.
    } finally {
      isSyncingFromPropRef.current = false;
    }
  }, [polygonWkt]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-white/10 ${heightClassName}`}
    >
      <div ref={mapRef} className="h-full w-full" />

      {!readOnly && (
        <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
          <p className="text-sm font-semibold text-white">
            {mode === "point" ? "Place a point" : "Draw area"}
          </p>
          <p className="mt-1 text-xs text-white/70">
            {mode === "point"
              ? "Click on the map to place a point. Press Delete to remove it."
              : "Draw a polygon. Edit the WKT to update the map. Press Delete to remove it."}
          </p>
        </div>
      )}
    </div>
  );
}
