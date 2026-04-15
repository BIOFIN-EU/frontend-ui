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
  onPolygonWktChange?: (wkt: string) => void;
};

function featureToWkt(feature: Feature<Geometry>) {
  const wktFormat = new WKT();
  const cloned = feature.clone();
  cloned.getGeometry()?.transform("EPSG:3857", "EPSG:4326");
  return wktFormat.writeFeature(cloned);
}

export default function RiskMap({ onPolygonWktChange }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const vectorSource = new VectorSource();

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
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer,
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

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

    map.addInteraction(draw);
    map.addInteraction(modify);
    map.addInteraction(select);

    draw.on("drawstart", () => {
      vectorSource.clear();
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
      if (e.key === "Delete") {
        const selected = select.getFeatures();
        selected.forEach((feature) => vectorSource.removeFeature(feature));
        selected.clear();
        onPolygonWktChange?.("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      map.setTarget(undefined);
    };
  }, [onPolygonWktChange]);

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-2xl border border-white/10">
      <div ref={mapRef} className="h-full w-full" />

      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
        <p className="text-sm font-semibold text-white">Draw area</p>
        <p className="mt-1 text-xs text-white/70">
          Draw a polygon. Press Delete to remove it.
        </p>
      </div>
    </div>
  );
}