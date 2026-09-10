"use client";

import { useEffect, useRef, useState } from "react";
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
import ScaleLine from "ol/control/ScaleLine";
import { defaults as defaultControls } from "ol/control/defaults.js";

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
  resiliencePolygons: Record<string, string>;   // new
  resilienceMeta: RecommendationsMeta;         // new
  riskPolygons: Record<string, string>;
  riskMeta: RecommendationsMeta;
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
  resiliencePolygons,
  resilienceMeta,
  riskPolygons,
  riskMeta
}: Props) {
  const [activeMode, setActiveMode] = useState<'recommendations' | 'resilience' | 'risk'>('recommendations');
  const recommendationLayerRef = useRef<VectorLayer | null>(null);
  const resilienceLayerRef = useRef<VectorLayer | null>(null);
  const riskLayerRef = useRef<VectorLayer | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create the scale line control with your desired configuration
    const scaleControl = new ScaleLine({
      units: "metric", // or "imperial", "nautical", "degrees"
      bar: true, // true for scale bar, false for text-only scale line
      steps: 4, // number of steps in the scale bar
      text: true, // show scale text
      minWidth: 140, // minimum width of the scale bar
    });

    const vectorSource = new VectorSource();

    // Create main polygon layer (outline only)
    const mainPolygonLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: "#000000",
          width: 3,
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
          stroke: null, // Explicitly remove any stroke
          fill: new Fill({
            color: `${color}FF`, // Add 0.5 alpha
          }),
        });
      },
    });
    recommendationLayerRef.current = recommendationLayer;
        // ---- Create resilience layer ----
    const resilienceSource = new VectorSource();
    Object.entries(resiliencePolygons).forEach(([category, wktString]) => {
      const meta = resilienceMeta[category];
      if (meta && wktString) {
        try {
          const feature = wktToFeature(wktString);
          feature.set('label', meta.label);
          feature.set('description', meta.description);
          feature.set('color', meta.color);
          feature.set('category', category);
          resilienceSource.addFeature(feature);
        } catch (error) {
          console.error(`Error adding resilience polygon for category ${category}:`, error);
        }
      }
    });

    const resilienceLayer = new VectorLayer({
      source: resilienceSource,
      style: (feature) => {
        const color = feature.get('color') || '#cccccc';
        return new Style({
          stroke: null,
          fill: new Fill({
            color: `${color}FF`,
          }),
        });
      },
    });
    resilienceLayerRef.current = resilienceLayer;



        // ---- Create risk layer ----
    const riskSource = new VectorSource();
    Object.entries(riskPolygons).forEach(([category, wktString]) => {
      const meta = riskMeta[category];
      if (meta && wktString) {
        try {
          const feature = wktToFeature(wktString);
          feature.set('label', meta.label);
          feature.set('description', meta.description);
          feature.set('color', meta.color);
          feature.set('category', category);
          riskSource.addFeature(feature);
        } catch (error) {
          console.error(`Error adding risk polygon for category ${category}:`, error);
        }
      }
    });

    const riskLayer = new VectorLayer({
      source: riskSource,
      style: (feature) => {
        const color = feature.get('color') || '#cccccc';
        return new Style({
          stroke: null,
          fill: new Fill({
            color: `${color}FF`,
          }),
        });
      },
    });
    riskLayerRef.current = riskLayer;
    riskLayer.setVisible(activeMode === "risk");
    recommendationLayer.setVisible(activeMode === "recommendations");
    resilienceLayer.setVisible(activeMode === "resilience");

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
      controls: defaultControls().extend([scaleControl]), // Add this line
      layers: [
        new TileLayer({ source: new OSM() }),
        mainPolygonLayer,
        recommendationLayer,
        resilienceLayer,
        riskLayer,
      ],
      view: new View({
        center: [794421.1588563935, 6809900.680716462],
        zoom: 6.76519547453094,
      }),
    });

    map.addOverlay(popupOverlay);


    // Handle click events on the map
    map.on('click', (event) => {
      // Check if we clicked on a feature in the recommendation layer
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => {
        return feature;
      }, {
        layerFilter: (layer) => layer === recommendationLayer || layer === resilienceLayer || layer === riskLayer,
      });

      if (feature) {
        // Get the feature's metadata
        const label = feature.get('label');
        // const description = feature.get('description');
        const color = feature.get('color');

        // Set popup content
        popupElement.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 12px; height: 12px; border-radius: 3px; background-color: ${color}; border: 1px solid rgba(255,255,255,0.3);"></div>
              <strong style="font-size: 16px; color: white;">${label}</strong>
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
        layerFilter: (layer) => layer === recommendationLayer || layer === resilienceLayer || layer === riskLayer,
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
    window.mapInstance = map;

    return () => {
      map.setTarget(undefined);
      mapInstanceRef.current = null;
    };
  }, [polygonWkt, recommendationsPolygons, recommendationsMeta, resiliencePolygons, resilienceMeta, riskPolygons, riskMeta]);

  useEffect(() => {
    if (recommendationLayerRef.current && resilienceLayerRef.current && riskLayerRef.current) {
      recommendationLayerRef.current.setVisible(activeMode === "recommendations");
      resilienceLayerRef.current.setVisible(activeMode === "resilience");
      riskLayerRef.current.setVisible(activeMode === "");
    }
  }, [activeMode]);

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-2xl border border-white/10">
      <div className="absolute left-8 top-4 flex gap-2 rounded-xl z-10 bg-black/50 p-1 backdrop-blur-sm border border-white/10">
        <button
          onClick={() => setActiveMode("recommendations")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeMode === "recommendations"
              ? "bg-emerald-500 text-white"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          Recommendations
        </button>
        <button
          onClick={() => setActiveMode("resilience")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeMode === "resilience"
              ? "bg-emerald-500 text-white"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          Resilience
        </button>
        <button
          onClick={() => setActiveMode("risk")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeMode === "risk"
              ? "bg-emerald-500 text-white"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          Vulnerability
        </button>
      </div>
      <div ref={mapRef} className="h-full w-full" />

      {/* <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
        <p className="text-sm font-semibold text-white">Management Actions Map</p>
        <p className="mt-1 text-xs text-white/70">
          Click on any colored area to see management action details
        </p>
      </div> */}
    </div>
  );



}
