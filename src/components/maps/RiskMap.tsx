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
import { Style, Stroke, Fill } from "ol/style";
import WKT from "ol/format/WKT";
import type Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";

type Props = {
  polygonWkt: string;
  onPolygonWktChange?: (wkt: string) => void;
};

const wktFormat = new WKT();

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

export default function RiskMap({ polygonWkt, onPolygonWktChange }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const selectRef = useRef<Select | null>(null);
  const isSyncingFromPropRef = useRef(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: "#6ee7b7",
          width: 3,
        }),
        fill: new Fill({
          color: "rgba(52, 211, 153, 0.2)",
        }),
      }),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    mapInstanceRef.current = map;

    const draw = new Draw({
      source: vectorSource,
      type: "Polygon",
    });

    const modify = new Modify({
      source: vectorSource,
    });

    const select = new Select({
      condition: click,
    });

    selectRef.current = select;

    map.addInteraction(draw);
    map.addInteraction(modify);
    map.addInteraction(select);

    draw.on("drawstart", () => {
      isSyncingFromPropRef.current = true;
      vectorSource.clear();
      select.getFeatures().clear();
      isSyncingFromPropRef.current = false;

      onPolygonWktChange?.("");
    });

    draw.on("drawend", (event: DrawEvent) => {
      const wkt = featureToWkt(event.feature);
      onPolygonWktChange?.(wkt);
    });

    modify.on("modifyend", (event) => {
      const features = event.features.getArray();
      if (!features.length) {
        onPolygonWktChange?.("");
        return;
      }

      const wkt = featureToWkt(features[0]);
      onPolygonWktChange?.(wkt);
    });

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete") return;

      const selected = select.getFeatures();
      selected.forEach((feature) => vectorSource.removeFeature(feature));
      selected.clear();
      onPolygonWktChange?.("");
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      map.setTarget(undefined);
      mapInstanceRef.current = null;
      vectorSourceRef.current = null;
      selectRef.current = null;
    };
  }, [onPolygonWktChange]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const vectorSource = vectorSourceRef.current;
    const select = selectRef.current;

    if (!map || !vectorSource) return;
    if (isSyncingFromPropRef.current) return;

    const existingFeatures = vectorSource.getFeatures();
    const existingWkt =
      existingFeatures.length > 0 ? featureToWkt(existingFeatures[0]) : "";

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
        map.getView().fit(geometry, {
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
    <div className="relative h-[460px] w-full overflow-hidden rounded-2xl border border-white/10">
      <div ref={mapRef} className="h-full w-full" />

      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
        <p className="text-sm font-semibold text-white">Draw area</p>
        <p className="mt-1 text-xs text-white/70">
          Draw a polygon. Edit the WKT to update the map. Press Delete to remove
          it.
        </p>
      </div>
    </div>
  );
}