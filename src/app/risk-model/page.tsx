"use client";

import React, { useMemo, useState } from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Info, MapPin, Pentagon, ShieldAlert, Leaf, ThermometerSun, Waves, Bird, Trees } from "lucide-react";
import dynamic from "next/dynamic";

type Mode = "point" | "polygon";

type Point = { x: number; y: number };

type Region = {
  id: string;
  name: string;
  polygon: string;
  riskBase: number;
  climateBase: number;
  waterStress: number;
  habitatFragmentation: number;
  speciesLossDrivers: string[];
  speciesGainDrivers: string[];
  biome: string;
};



const REGIONS: Region[] = [
  {
    id: "iberia",
    name: "Iberian Corridor",
    polygon: "70,250 145,215 190,245 170,305 105,318 65,288",
    riskBase: 63,
    climateBase: 58,
    waterStress: 71,
    habitatFragmentation: 54,
    speciesLossDrivers: ["Pollinator decline", "Wetland bird loss", "Soil biota stress"],
    speciesGainDrivers: ["Shrubland resilience", "Dryland plant expansion"],
    biome: "Mediterranean mosaic",
  },
  {
    id: "central",
    name: "Central Europe Belt",
    polygon: "220,155 310,140 360,175 350,240 280,252 210,220",
    riskBase: 74,
    climateBase: 69,
    waterStress: 56,
    habitatFragmentation: 78,
    speciesLossDrivers: ["Farmland bird decline", "Forest edge loss", "Amphibian pressure"],
    speciesGainDrivers: ["Urban-adaptive species gain"],
    biome: "Temperate forest-agriculture",
  },
  {
    id: "north",
    name: "Nordic Arc",
    polygon: "250,55 335,40 385,85 360,145 285,130 235,98",
    riskBase: 41,
    climateBase: 64,
    waterStress: 24,
    habitatFragmentation: 37,
    speciesLossDrivers: ["Arctic specialist retreat", "Peatland disturbance"],
    speciesGainDrivers: ["Forest expansion", "Freshwater recovery"],
    biome: "Boreal and tundra transition",
  },
  {
    id: "balkans",
    name: "Balkan Biodiversity Zone",
    polygon: "390,195 455,180 495,215 475,285 410,298 375,248",
    riskBase: 68,
    climateBase: 73,
    waterStress: 61,
    habitatFragmentation: 66,
    speciesLossDrivers: ["Karst freshwater pressure", "Grassland conversion", "Large carnivore corridor breaks"],
    speciesGainDrivers: ["Riparian restoration gains"],
    biome: "Mountain and mixed woodland",
  },
  {
    id: "east",
    name: "Eastern Plains",
    polygon: "470,110 590,95 645,165 620,250 520,255 452,185",
    riskBase: 59,
    climateBase: 67,
    waterStress: 49,
    habitatFragmentation: 62,
    speciesLossDrivers: ["Steppe habitat decline", "River floodplain loss"],
    speciesGainDrivers: ["Generalist mammal expansion"],
    biome: "Continental plains",
  },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function centroid(points: Point[]) {
  const total = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  return { x: total.x / points.length, y: total.y / points.length };
}

function distance(a: Point, b: Point) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function nearestRegion(p: Point) {
  const anchors = [
    { id: "iberia", x: 120, y: 266 },
    { id: "central", x: 285, y: 193 },
    { id: "north", x: 305, y: 90 },
    { id: "balkans", x: 435, y: 235 },
    { id: "east", x: 555, y: 175 },
  ];

  let best = anchors[0];
  let bestDist = distance(p, anchors[0]);
  for (const anchor of anchors.slice(1)) {
    const d = distance(p, anchor);
    if (d < bestDist) {
      best = anchor;
      bestDist = d;
    }
  }
  return REGIONS.find((r) => r.id === best.id) ?? REGIONS[0];
}

function computeSelectionMetrics(points: Point[], mode: Mode) {
  const center = centroid(points);
  const region = nearestRegion(center);
  const spread =
    points.length > 1
      ? points.reduce((sum, p) => sum + distance(center, p), 0) / points.length
      : 18;

  const geographicModifier = ((center.x / 700) * 8 + (center.y / 360) * 6) - 5;
  const scaleModifier = mode === "polygon" ? clamp(spread / 10, 2, 12) : 3;

  const riskScore = clamp(Math.round(region.riskBase + geographicModifier + scaleModifier), 12, 97);
  const climateRisk = clamp(Math.round(region.climateBase + geographicModifier / 2), 10, 98);
  const biodiversityPressure = clamp(Math.round((riskScore * 0.5) + region.habitatFragmentation * 0.3 + region.waterStress * 0.2), 10, 99);
  const restorationPotential = clamp(Math.round(100 - riskScore + (mode === "polygon" ? 8 : 0)), 8, 88);
  const confidence = clamp(Math.round(62 + points.length * 6 + (mode === "polygon" ? 8 : 0)), 40, 96);

  const trend = Array.from({ length: 8 }).map((_, i) => {
    const year = 2018 + i;
    const drift = i * (riskScore > 60 ? 1.8 : 0.8);
    const seasonal = Math.sin(i / 1.5) * 3;
    return {
      year: String(year),
      biodiversityRisk: clamp(Math.round(riskScore - 10 + drift + seasonal), 0, 100),
      habitatIntegrity: clamp(Math.round(80 - drift - seasonal - geographicModifier), 0, 100),
    };
  });

  const pressures = [
    { subject: "Climate", value: climateRisk },
    { subject: "Water", value: region.waterStress },
    { subject: "Habitat", value: region.habitatFragmentation },
    { subject: "Species", value: biodiversityPressure },
    { subject: "Land Use", value: clamp(Math.round(riskScore - 6), 0, 100) },
    { subject: "Restoration", value: restorationPotential },
  ];

  const provenance = [
    { name: "Species loss", value: clamp(Math.round(biodiversityPressure * 0.42), 5, 60) },
    { name: "Climate signal", value: clamp(Math.round(climateRisk * 0.28), 5, 45) },
    { name: "Habitat fragmentation", value: clamp(Math.round(region.habitatFragmentation * 0.18), 4, 35) },
    { name: "Hydrological stress", value: clamp(Math.round(region.waterStress * 0.12), 3, 25) },
  ];

  return {
    center,
    region,
    riskScore,
    climateRisk,
    biodiversityPressure,
    restorationPotential,
    confidence,
    trend,
    pressures,
    provenance,
    speciesLossDrivers: region.speciesLossDrivers,
    speciesGainDrivers: region.speciesGainDrivers,
  };
}

function pointsToString(points: Point[]) {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

const RiskLeafletMap = dynamic(() => import("@/components/RiskLeafletMap"), {
  ssr: false,
});

export default function RiskModelPage() {
  const [mode, setMode] = useState<Mode>("point");
  const [points, setPoints] = useState<Point[]>([{ x: 308, y: 190 }]);

  const metrics = useMemo(() => computeSelectionMetrics(points, mode), [points, mode]);

  function resetSelection(nextMode: Mode) {
    setMode(nextMode);
    setPoints(nextMode === "point" ? [{ x: 308, y: 190 }] : []);
  }


  const hasPolygon = mode === "polygon" && points.length >= 3;
  const mapHint =
    mode === "point"
      ? "Click anywhere on the map to place a risk assessment point."
      : points.length < 3
      ? "Click 3 or more times to create a polygon area."
      : "Polygon created. Keep clicking to refine the boundary.";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_25%),linear-gradient(180deg,#07111a_0%,#09131d_100%)] text-white">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <header className="space-y-4">
          <div className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
            Biodiversity risk model
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Biodiversity Risk Explorer
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
                Explore dummy biodiversity risk indicators across Europe, place a point or draw a polygon, and inspect a mock risk score, provenance signals, climate stress, and species loss or gain drivers.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => resetSelection("point")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 transition ${
                  mode === "point"
                    ? "bg-emerald-400/15 text-emerald-100 ring-emerald-300/30"
                    : "bg-white/8 text-white ring-white/15 hover:bg-white/12"
                }`}
              >
                <MapPin className="h-4 w-4" />
                Point mode
              </button>
              <button
                onClick={() => resetSelection("polygon")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 transition ${
                  mode === "polygon"
                    ? "bg-emerald-400/15 text-emerald-100 ring-emerald-300/30"
                    : "bg-white/8 text-white ring-white/15 hover:bg-white/12"
                }`}
              >
                <Pentagon className="h-4 w-4" />
                Polygon mode
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                  Interactive map
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Spatial biodiversity screening</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10">
                <Info className="h-3.5 w-3.5" />
                {mapHint}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#07121d] ring-1 ring-white/5">
              <RiskLeafletMap mode={mode} points={points} setPoints={setPoints} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Risk score", value: metrics.riskScore, icon: ShieldAlert, tone: "text-red-200" },
                { label: "Climate stress", value: metrics.climateRisk, icon: ThermometerSun, tone: "text-amber-200" },
                { label: "Biodiversity pressure", value: metrics.biodiversityPressure, icon: Bird, tone: "text-violet-200" },
                { label: "Restoration potential", value: metrics.restorationPotential, icon: Leaf, tone: "text-emerald-200" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{item.label}</p>
                      <Icon className={`h-4 w-4 ${item.tone}`} />
                    </div>
                    <p className="mt-3 text-3xl font-semibold">{item.value}</p>
                    <p className="mt-1 text-xs text-white/45">Mode: {mode === "point" ? "Single site" : "Polygon area"}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Selection summary</p>
                  <h3 className="mt-1 text-xl font-semibold">{metrics.region.name}</h3>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
                  Confidence {metrics.confidence}%
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                  <p className="text-xs font-medium text-white/55">Biome context</p>
                  <p className="mt-1 text-sm font-semibold text-white">{metrics.region.biome}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                    <p className="text-xs font-medium text-white/55">Selection type</p>
                    <p className="mt-1 text-sm font-semibold text-white">{mode === "point" ? "Point assessment" : `${points.length}-vertex polygon`}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                    <p className="text-xs font-medium text-white/55">Water stress</p>
                    <p className="mt-1 text-sm font-semibold text-white">{metrics.region.waterStress}/100</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Provenance</p>
              <h3 className="mt-1 text-xl font-semibold">What is driving the score?</h3>
              <div className="mt-4 space-y-3">
                {metrics.provenance.map((item) => (
                  <div key={item.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-white/70">{item.name}</span>
                      <span className="font-semibold text-white">{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/8">
                      <div className="h-2 rounded-full bg-emerald-300/80" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Ecological signal</p>
              <div className="mt-4 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-100">
                    <Bird className="h-4 w-4" /> Species loss drivers
                  </div>
                  <ul className="space-y-2 text-sm text-white/70">
                    {metrics.speciesLossDrivers.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-100">
                    <Trees className="h-4 w-4" /> Species / habitat gain signals
                  </div>
                  <ul className="space-y-2 text-sm text-white/70">
                    {metrics.speciesGainDrivers.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <div className="grid gap-8 xl:grid-cols-3">
          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md xl:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Trend over time</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Biodiversity loss & integrity trend</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-xs text-white/65 ring-1 ring-white/10">
                <Waves className="h-3.5 w-3.5" /> Dummy time series 2018–2025
              </span>
            </div>

            <div className="h-80 rounded-2xl border border-white/10 bg-black/20 p-3 ring-1 ring-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.trend}>
                  <defs>
                    <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="integrityFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="year" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(8,16,26,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 16,
                      color: "white",
                    }}
                  />
                  <Area type="monotone" dataKey="biodiversityRisk" stroke="#fb923c" fill="url(#riskFill)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="habitatIntegrity" stroke="#34d399" fill="url(#integrityFill)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Pressure profile</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Multi-factor risk lens</h2>
            <div className="mt-4 h-80 rounded-2xl border border-white/10 bg-black/20 p-3 ring-1 ring-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={metrics.pressures} outerRadius="70%">
                  <PolarGrid stroke="rgba(255,255,255,0.12)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.68)", fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="#6ee7b7" fill="#6ee7b7" fillOpacity={0.28} strokeWidth={2.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Score provenance</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Contribution of risk sources</h2>
            </div>
            <p className="text-sm text-white/55">Illustrative breakdown for the active selection</p>
          </div>

          <div className="h-72 rounded-2xl border border-white/10 bg-black/20 p-3 ring-1 ring-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.provenance}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(8,16,26,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    color: "white",
                  }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#6ee7b7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
