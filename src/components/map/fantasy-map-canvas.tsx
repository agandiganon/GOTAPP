"use client";

import { useEffect, useMemo, useState } from "react";
import type { LatLngBoundsExpression } from "leaflet";
import L from "leaflet";
import { ImageOverlay, MapContainer, Marker, Tooltip, useMap, ZoomControl } from "react-leaflet";
import { X } from "lucide-react";

import type { MapPinKind } from "@/lib/map-presentation";
import { getProxiedExternalImageUrl } from "@/lib/media";

/* ─── Map canvas dimensions (DO NOT CHANGE — matches coordinate data) ───── */
export const MAP_IMAGE_WIDTH  = 1409;
export const MAP_IMAGE_HEIGHT = 944;

const MAP_BOUNDS: LatLngBoundsExpression = [
  [0, 0],
  [MAP_IMAGE_HEIGHT, MAP_IMAGE_WIDTH],
];

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface FantasyMapPin {
  id: string;
  name: string;
  region: string;
  summary: string;
  topPercent: number;
  leftPercent: number;
  isPrimary: boolean;
  isFocused: boolean;
  kind: MapPinKind;
  controllerFaction: {
    id: string;
    name: string;
    themeColor: string;
    sigilUrl: string | null;
  } | null;
}

interface FantasyMapCanvasProps {
  pins: FantasyMapPin[];
  focusLocationId: string | null;
}

/* ─── Coordinate helpers (DO NOT CHANGE) ────────────────────────────────── */
export function toMapPoint(topPercent: number, leftPercent: number): [number, number] {
  return [
    (MAP_IMAGE_HEIGHT * topPercent) / 100,
    (MAP_IMAGE_WIDTH  * leftPercent) / 100,
  ];
}

/* ─── Custom marker icon markup ─────────────────────────────────────────── */
function createGlyphMarkup(kind: MapPinKind) {
  if (kind === "stronghold") {
    return `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
         stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">
      <path d="M4 20V8.5h3V5h2.4v3.5h5.2V5H17v3.5h3V20" />
      <path d="M9 20v-4.8h6V20" />
      <path d="M7.7 12h.01" /><path d="M12 12h.01" /><path d="M16.3 12h.01" />
    </svg>`;
  }
  if (kind === "city") {
    return `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
         stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">
      <path d="M12 3.5 18 9l-1.8 10.5H7.8L6 9l6-5.5Z" />
      <path d="M12 8v5.5" />
    </svg>`;
  }
  return `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor"
       stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">
    <path d="M12 3.5 19 10l-7 10-7-10 7-6.5Z" />
  </svg>`;
}

function createFactionBadgeMarkup(controllerFaction: FantasyMapPin["controllerFaction"]) {
  if (!controllerFaction) return "";
  if (controllerFaction.sigilUrl) {
    const safeUrl = encodeURI(getProxiedExternalImageUrl(controllerFaction.sigilUrl))
      .replaceAll('"', "%22").replaceAll("'", "%27");
    return `<span class="map-location-marker__badge" style="--badge-tone:${controllerFaction.themeColor};">
      <img src="${safeUrl}" alt="" draggable="false" />
    </span>`;
  }
  return `<span class="map-location-marker__badge" style="--badge-tone:${controllerFaction.themeColor};">
    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor"
         stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">
      <path d="M12 3.5 18 6v5c0 4-2.7 7-6 9-3.3-2-6-5-6-9V6l6-2.5Z" />
    </svg>
  </span>`;
}

function createMarkerIcon(pin: FantasyMapPin, isSelected: boolean) {
  return L.divIcon({
    className: "map-location-marker-shell",
    iconSize:     [30, 42],
    iconAnchor:   [15, 36],
    tooltipAnchor:[0, -28],
    html: `<span
      class="map-location-marker${pin.isPrimary  ? " is-primary"  : ""}${pin.isFocused  ? " is-focused"  : ""}${isSelected ? " is-selected" : ""}${pin.controllerFaction ? " has-faction" : ""}"
      aria-hidden="true"
      style="--marker-tone:${pin.controllerFaction?.themeColor ?? "#cba55c"};"
    >
      <span class="map-location-marker__halo"></span>
      <span class="map-location-marker__core">${createGlyphMarkup(pin.kind)}</span>
      ${createFactionBadgeMarkup(pin.controllerFaction)}
      <span class="map-location-marker__tip"></span>
    </span>`,
  });
}

/* ─── Tooltip direction (static, avoids clipping near edges) ────────────── */
function getTooltipDirection(pin: FantasyMapPin): "top" | "bottom" | "left" | "right" {
  if (pin.topPercent  < 16) return "bottom";
  if (pin.leftPercent < 12) return "right";
  if (pin.leftPercent > 88) return "left";
  return "top";
}

function getTooltipOffset(dir: "top" | "bottom" | "left" | "right"): [number, number] {
  if (dir === "bottom") return [0, 14];
  if (dir === "right")  return [14, 0];
  if (dir === "left")   return [-14, 0];
  return [0, -18];
}

/* ─── Marker component ───────────────────────────────────────────────────── */
function MapLocationMarker({
  pin,
  isSelected,
  onSelect,
}: {
  pin: FantasyMapPin;
  isSelected: boolean;
  onSelect: (pin: FantasyMapPin) => void;
}) {
  const center    = toMapPoint(pin.topPercent, pin.leftPercent);
  const direction = getTooltipDirection(pin);
  const offset    = getTooltipOffset(direction);
  // Re-create icon only when selection state changes
  const icon = useMemo(
    () => createMarkerIcon(pin, isSelected),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pin.id, pin.isPrimary, pin.isFocused, isSelected, pin.controllerFaction?.id],
  );

  return (
    <Marker
      position={center}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(pin),
      }}
    >
      <Tooltip
        className="map-location-tooltip"
        direction={direction}
        offset={offset}
        opacity={1}
        // Hide tooltip while pin is selected (info panel shows instead)
        permanent={false}
      >
        <div dir="rtl" className="whitespace-nowrap text-right" style={{ direction: "rtl" }}>
          <p className="font-display text-[0.95rem] text-amber-100">{pin.name}</p>
          {pin.region && (
            <p className="text-[0.60rem] text-stone-500 mt-0.5">{pin.region}</p>
          )}
          {pin.controllerFaction && (
            <p className="text-[0.62rem] text-amber-300/80">בשליטת {pin.controllerFaction.name}</p>
          )}
        </div>
      </Tooltip>
    </Marker>
  );
}

/* ─── Map view controller (DO NOT CHANGE — uses existing coordinate data) ── */
function MapViewController({
  focusPoint,
  selectedPoint,
}: {
  focusPoint: [number, number] | null;
  selectedPoint: [number, number] | null;
}) {
  const map = useMap();

  // Initial fit
  useEffect(() => {
    map.fitBounds(MAP_BOUNDS, { animate: false, padding: [64, 80] });
    map.invalidateSize();
  }, [map]);

  // External focus (from URL param / location link)
  useEffect(() => {
    if (!focusPoint) return;
    map.flyTo(focusPoint, 0.6, { animate: true, duration: 0.85 });
  }, [focusPoint, map]);

  // Pan to selected pin — gently, without locking
  useEffect(() => {
    if (!selectedPoint) return;
    const containerSize = map.getSize();
    const targetPoint   = map.latLngToContainerPoint(selectedPoint);
    // Only pan if marker is near the edge of the viewport
    const margin = 80;
    if (
      targetPoint.x < margin || targetPoint.x > containerSize.x - margin ||
      targetPoint.y < margin || targetPoint.y > containerSize.y - margin
    ) {
      map.panTo(selectedPoint, { animate: true, duration: 0.4 });
    }
  }, [selectedPoint, map]);

  return null;
}

/* ─── Selected location info panel (lives OUTSIDE the Leaflet DOM) ───────── */
function LocationInfoPanel({
  pin,
  onClose,
}: {
  pin: FantasyMapPin;
  onClose: () => void;
}) {
  return (
    <div
      dir="rtl"
      className="map-info-panel animate-map-panel-in"
      role="dialog"
      aria-label={`פרטי מיקום: ${pin.name}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[1.1rem] leading-snug text-amber-100 truncate">{pin.name}</p>
          {pin.region && (
            <p className="text-[0.62rem] tracking-wide text-stone-500 mt-0.5">{pin.region}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {pin.controllerFaction && (
            <span
              className="rounded-full px-2 py-0.5 text-[0.6rem] font-medium border"
              style={{
                background: `${pin.controllerFaction.themeColor}18`,
                borderColor: `${pin.controllerFaction.themeColor}40`,
                color: pin.controllerFaction.themeColor,
              }}
            >
              {pin.controllerFaction.name}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-700/50 bg-stone-900/60 text-stone-400 hover:bg-stone-800/80 hover:text-stone-200 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Summary */}
      {pin.summary && (
        <p className="mt-2.5 text-[0.78rem] leading-[1.7] text-stone-300/90 border-t border-stone-800/60 pt-2.5">
          {pin.summary}
        </p>
      )}

      {/* Kind badge */}
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[0.58rem] font-semibold uppercase tracking-[0.20em] text-stone-600">
          {pin.kind === "stronghold" ? "מצודה" : pin.kind === "city" ? "עיר" : "אזור"}
        </span>
        {pin.isPrimary && (
          <>
            <span className="text-stone-700">·</span>
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.20em] text-amber-500/70">
              מוקד הפרק
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main canvas component ─────────────────────────────────────────────── */
export function FantasyMapCanvas({ pins, focusLocationId }: FantasyMapCanvasProps) {
  const [selectedPin, setSelectedPin] = useState<FantasyMapPin | null>(null);

  const focusPoint = useMemo(() => {
    if (!focusLocationId) return null;
    const pin = pins.find((p) => p.id === focusLocationId);
    if (pin) {
      // Auto-select the focused pin
      setSelectedPin(pin);
      return toMapPoint(pin.topPercent, pin.leftPercent);
    }
    return null;
  }, [focusLocationId, pins]);

  const selectedPoint = useMemo(
    () => selectedPin ? toMapPoint(selectedPin.topPercent, selectedPin.leftPercent) : null,
    [selectedPin],
  );

  const handlePinSelect = (pin: FantasyMapPin) => {
    setSelectedPin((prev) => (prev?.id === pin.id ? null : pin));
  };

  return (
    <div dir="ltr" className="ltr relative h-full w-full" aria-label="מפת ווסטרוז ואסוס">
      {/* Inner wrapper — parchment vignette */}
      <div className="map-parchment-container relative h-full w-full overflow-hidden rounded-[inherit] bg-stone-950">

        <MapContainer
          className="ltr h-full w-full"
          crs={L.CRS.Simple}
          bounds={MAP_BOUNDS}
          attributionControl={false}
          zoomControl={false}
          minZoom={-1.5}
          maxZoom={2}
          zoomSnap={0.25}
          wheelPxPerZoomLevel={120}
          scrollWheelZoom="center"
        >
          <ZoomControl position="bottomright" />
          <MapViewController focusPoint={focusPoint} selectedPoint={selectedPoint} />
          <ImageOverlay url="/images/world-map.jpg" bounds={MAP_BOUNDS} className="select-none" />
          {pins.map((pin) => (
            <MapLocationMarker
              key={pin.id}
              pin={pin}
              isSelected={selectedPin?.id === pin.id}
              onSelect={handlePinSelect}
            />
          ))}
        </MapContainer>

        {/* Parchment corner-fade vignette — pointer-events none */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background: `radial-gradient(ellipse 120% 100% at 50% 50%,
              transparent 45%, rgba(4,6,14,0.55) 78%, rgba(4,6,14,0.82) 100%)`,
            zIndex: 9999,
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[16%] rounded-t-[inherit]"
          style={{
            background: "linear-gradient(to bottom, rgba(205,164,94,0.07), transparent)",
            zIndex: 9999,
          }}
        />

        {/* ── Map Legend (top-right) ─────────────────────────────────────── */}
        <div
          dir="rtl"
          className="pointer-events-none absolute right-3 top-3 rounded-[14px] border border-stone-700/40 px-3 py-2.5 backdrop-blur-md"
          style={{ background: "rgba(8,10,16,0.88)", zIndex: 10000, minWidth: "118px" }}
        >
          <p className="mb-1.5 text-[0.53rem] font-semibold uppercase tracking-[0.22em] text-amber-400/50">מקרא</p>
          <div className="space-y-1.5">
            {[
              { label: "מצודה", color: "rgba(203,165,94,0.45)", icon: <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="rgba(203,165,94,0.9)" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20V8.5h3V5h2.4v3.5h5.2V5H17v3.5h3V20" /><path d="M9 20v-4.8h6V20" /></svg> },
              { label: "עיר",   color: "rgba(160,140,100,0.40)", icon: <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="rgba(180,155,100,0.85)" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.5 18 9l-1.8 10.5H7.8L6 9l6-5.5Z" /></svg> },
              { label: "אזור",  color: "rgba(120,110,88,0.35)",  icon: <svg viewBox="0 0 24 24" width="9"  height="9"  fill="none" stroke="rgba(140,125,95,0.75)"  strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.5 19 10l-7 10-7-10 7-6.5Z" /></svg> },
            ].map(({ label, color, icon }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border"
                  style={{ background: "linear-gradient(180deg,rgba(16,20,34,0.98),rgba(8,11,18,0.97))", borderColor: color }}>
                  {icon}
                </span>
                <span className="text-[0.66rem] text-stone-400">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border"
                style={{ background: "linear-gradient(180deg,rgba(52,40,27,0.98),rgba(22,16,11,0.97))", borderColor: "rgba(241,213,154,0.75)", boxShadow: "0 0 6px rgba(203,165,94,0.18)" }}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="rgba(252,239,208,0.98)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3.5 18 6v5c0 4-2.7 7-6 9-3.3-2-6-5-6-9V6l6-2.5Z" />
                </svg>
              </span>
              <span className="text-[0.66rem] text-amber-300/70">מוקד פרק</span>
            </div>
          </div>
        </div>

        {/* ── Hint (bottom-left) ─────────────────────────────────────────── */}
        <div
          dir="rtl"
          className="pointer-events-none absolute bottom-12 left-3 rounded-[10px] border border-stone-700/25 px-2.5 py-1 backdrop-blur-sm"
          style={{ background: "rgba(10,7,5,0.75)", zIndex: 10000 }}
        >
          <p className="text-[0.56rem] text-stone-600">גלול לזום · לחץ על סמן לפרטים</p>
        </div>

        {/* ── Selected-pin info panel (inside map wrapper, above vignette) ─ */}
        {selectedPin && (
          <div className="absolute inset-x-3 bottom-3 z-[10001]">
            <LocationInfoPanel pin={selectedPin} onClose={() => setSelectedPin(null)} />
          </div>
        )}

      </div>
    </div>
  );
}
