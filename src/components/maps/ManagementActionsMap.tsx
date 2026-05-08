"use client";

import { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Style, Stroke, Fill } from "ol/style";
import WKT from "ol/format/WKT";
import type Feature from "ol/Feature";
import type Geometry from "ol/geom/Geometry";
import Overlay from "ol/Overlay";

type RecommendationsMeta = {
  [key: string]: {
    label: string;
    description: string;
    color: string;
    examples: string;
  };
};

type Props = {
  polygonWkt: string;
  recommendationsPolygons: Record<string, string>;
  recommendationsMeta: RecommendationsMeta;
};

const wktFormat = new WKT();

function wktToFeature(wkt: string) {
  const feature = wktFormat.readFeature(wkt, {
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
  });

  return feature as Feature<Geometry>;
}

export default function ManagementActionsMap({
  polygonWkt,
  recommendationsPolygons,
  recommendationsMeta,
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const vectorSource = new VectorSource();

    // Create main polygon layer (outline only)
    const mainPolygonLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: "#000000",
          width: 6,
        }),
        fill: new Fill({
          color: "rgba(0, 0, 0, 0)",
        }),
      }),
    });

    // Add main polygon if it exists
    if (polygonWkt && polygonWkt.trim()) {
      try {
        const mainFeature = wktToFeature(polygonWkt);
        vectorSource.addFeature(mainFeature);
      } catch (error) {
        console.error("Error adding main polygon:", error);
      }
    }

    // Create a single vector source for all recommendation polygons
    const recommendationSource = new VectorSource();

    // Add each recommendation polygon as a feature with its metadata
    Object.entries(recommendationsPolygons).forEach(([category, wktString]) => {
      const meta = recommendationsMeta[category];

      if (meta && wktString) {
        try {
          const feature = wktToFeature(wktString);
          // Store metadata as properties on the feature
          feature.set('label', meta.label);
          feature.set('description', meta.description);
          feature.set('color', meta.color);
          feature.set('category', category);

          recommendationSource.addFeature(feature);
        } catch (error) {
          console.error(`Error adding polygon for category ${category}:`, error);
        }
      }
    });

    // Style function that reads color from each feature
    const recommendationLayer = new VectorLayer({
      source: recommendationSource,
      style: (feature) => {
        const color = feature.get('color') || '#cccccc';
        return new Style({
          stroke: new Stroke({
            color: color,
            width: 2,
          }),
          fill: new Fill({
            color: `${color}80`, // Add 0.5 alpha
          }),
        });
      },
    });

    // Create popup overlay
    const popupElement = document.createElement('div');
    popupElement.className = 'ol-popup';
    popupElement.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 12px 16px;
      color: white;
      font-size: 14px;
      max-width: 300px;
      pointer-events: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 1000;
    `;

    const popupOverlay = new Overlay({
      element: popupElement,
      positioning: 'bottom-center',
      offset: [0, -10],
      stopEvent: false,
    });

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        mainPolygonLayer,
        recommendationLayer,
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    map.addOverlay(popupOverlay);

    // Handle click events on the map
    map.on('click', (event) => {
      // Check if we clicked on a feature in the recommendation layer
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => {
        return feature;
      }, {
        layerFilter: (layer) => layer === recommendationLayer,
      });

      if (feature) {
        // Get the feature's metadata
        const label = feature.get('label');
        const description = feature.get('description');
        const color = feature.get('color');

        // Set popup content
        popupElement.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; border-radius: 3px; background-color: ${color}; border: 1px solid rgba(255,255,255,0.3);"></div>
              <strong style="font-size: 16px; color: white;">${label}</strong>
            </div>
            <div style="font-size: 13px; color: rgba(255,255,255,0.85); line-height: 1.4;">
              ${description}
            </div>
          </div>
        `;

        // Position the popup at the click location
        popupOverlay.setPosition(event.coordinate);
      } else {
        // Hide popup if clicking outside any feature
        popupOverlay.setPosition(undefined);
      }
    });

    // Change cursor on hover over clickable features
    map.on('pointermove', (event) => {
      const hasFeature = map.hasFeatureAtPixel(event.pixel, {
        layerFilter: (layer) => layer === recommendationLayer,
      });
      const targetElement = map.getTargetElement();
      if (targetElement) {
        targetElement.style.cursor = hasFeature ? 'pointer' : '';
      }
    });

    // Fit view to show all polygons
    const allFeatures = [...vectorSource.getFeatures(), ...recommendationSource.getFeatures()];

    if (allFeatures.length > 0) {
      const extent = allFeatures.reduce((ext, feature) => {
        const geom = feature.getGeometry();
        if (geom) {
          const featureExtent = geom.getExtent();
          return [
            Math.min(ext[0], featureExtent[0]),
            Math.min(ext[1], featureExtent[1]),
            Math.max(ext[2], featureExtent[2]),
            Math.max(ext[3], featureExtent[3]),
          ];
        }
        return ext;
      }, [Infinity, Infinity, -Infinity, -Infinity]);

      if (extent[0] !== Infinity) {
        map.getView().fit(extent, {
          padding: [40, 40, 40, 40],
          maxZoom: 16,
          duration: 250,
        });
      }
    }

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
      mapInstanceRef.current = null;
    };
  }, [polygonWkt, recommendationsPolygons, recommendationsMeta]);

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-2xl border border-white/10">
      <div ref={mapRef} className="h-full w-full" />

      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
        <p className="text-sm font-semibold text-white">Management Actions Map</p>
        <p className="mt-1 text-xs text-white/70">
          Click on any colored area to see management action details
        </p>
      </div>
    </div>
  );
}
