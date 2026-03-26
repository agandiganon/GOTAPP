"use client";

import { useEffect, useMemo } from "react";
import type { LatLngBoundsExpression } from "leaflet";
import L from "leaflet";
import { ImageOverlay, MapContainer, Marker, Popup, Tooltip, useMap } from "react-leaflet";

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
interface FantasyMapPin {
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
function toMapPoint(topPercent: number, leftPercent: number): [number, number] {
  return [
    (MAP_IMAGE_HEIGHT * topPercent) / 100,
    (MAP_IMAGE_WIDTH  * leftPercent) / 100,
  ];
}

/* ─── Custom marker icon markup ─────────────────────────────────────────── */
function createGlyphMarkup(kind: MapPinKind) {
  if (kind === "stronghold") {
    return `
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
           stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"
           focusable="false" aria-hidden="true">
        <path d="M4 20V8.5h3V5h2.4v3.5h5.2V5H17v3.5h3V20" />
        <path d="M9 20v-4.8h6V20" />
        <path d="M7.7 12h.01" />
        <path d="M12 12h.01" />
        <path d="M16.3 12h.01" />
      </svg>
    `;
  }

  if (kind === "city") {
    return `
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
           stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"
           focusable="false" aria-hidden="true">
        <path d="M12 3.5 18 9l-1.8 10.5H7.8L6 9l6-5.5Z" />
        <path d="M12 8v5.5" />
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor"
         stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"
         focusable="false" aria-hidden="true">
      <path d="M12 3.5 19 10l-7 10-7-10 7-6.5Z" />
    </svg>
  `;
}

function createFactionBadgeMarkup(controllerFaction: FantasyMapPin["controllerFaction"]) {
  if (!controllerFaction) return "";

  if (controllerFaction.sigilUrl) {
    const safeUrl = encodeURI(getProxiedExternalImageUrl(controllerFaction.sigilUrl))
      .replaceAll('"', "%22")
      .replaceAll("'", "%27");

    return `
      <span class="map-location-marker__badge" style="--badge-tone:${controllerFaction.themeColor};">
        <img src="${safeUrl}" alt="" draggable="false" />
      </span>
    `;
  }

  return `
    <span class="map-location-marker__badge" style="--badge-tone:${controllerFaction.themeColor};">
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor"
           stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
           focusable="false" aria-hidden="true">
        <path d="M12 3.5 18 6v5c0 4-2.7 7-6 9-3.3-2-6-5-6-9V6l6-2.5Z" />
      </svg>
    </span>
  `;
}

function createMarkerIcon(pin: FantasyMapPin) {
  const iconWidth   = 30;
  const iconHeight  = 42;
  const iconAnchorX = 15;
  const iconAnchorY = 36;

  return L.divIcon({
    className: "map-location-marker-shell",
    iconSize:     [iconWidth, iconHeight],
    iconAnchor:   [iconAnchorX, iconAnchorY],
    tooltipAnchor:[0, -28],
    popupAnchor:  [0, -24],
    html: `
      <span
        class="map-location-marker${pin.isPrimary   ? " is-primary"  : ""}${pin.isFocused   ? " is-focused"  : ""}${pin.controllerFaction ? " has-faction" : ""}"
        aria-hidden="true"
        style="--marker-tone:${pin.controllerFaction?.themeColor ?? "#cba55c"};"
      >
        <span class="map-location-marker__halo"></span>
        <span class="map-location-marker__core">
          ${createGlyphMarkup(pin.kind)}
        </span>
        ${createFactionBadgeMarkup(pin.controllerFaction)}
        <span class="map-location-marker__tip"></span>
      </span>
    `,
  });
}

/* ─── Tooltip edge-awareness ─────────────────────────────────────────────── */
function getTooltipDirection(pin: FantasyMapPin) {
  if (pin.topPercent  < 18) return "bottom";
  if (pin.leftPercent < 14) return "right";
  if (pin.leftPercent > 86) return "left";
  return "top";
}

function getTooltipOffset(pin: FantasyMapPin): [number, number] {
  if (pin.topPercent  < 18) return [0,  18];
  if (pin.leftPercent < 14) return [18,  0];
  if (pin.leftPercent > 86) return [-18, 0];
  return [0, -18];
}

/* ─── Marker component ───────────────────────────────────────────────────── */
function MapLocationMarker({ pin }: { pin: FantasyMapPin }) {
  const map    = useMap();
  const center = toMapPoint(pin.topPercent, pin.leftPercent);

  const viewportPadding = useMemo(() => ({
    paddingTopLeft:     L.point(96, 108),
    paddingBottomRight: L.point(96, 152),
  }), []);

  const tooltipDirection = getTooltipDirection(pin);
  const tooltipOffset    = getTooltipOffset(pin);

  const keepVisible = () =>
    map.panInside(center, { ...viewportPadding, animate: true });

  return (
    <Marker
      position={center}
      icon={createMarkerIcon(pin)}
      eventHandlers={{
        click:       keepVisible,
        popupopen:   keepVisible,
        tooltipopen: keepVisible,
      }}
    >
      {/* ── Tooltip ─────────────────────────────────────── */}
      <Tooltip
        className="map-location-tooltip"
        direction="auto"
        offset={[0, -18]}
        opacity={1}
      >
        <div
          dir="rtl"
          className="space-y-0.5 whitespace-nowrap min-w-max text-right"
          style={{ whiteSpace: "nowrap", direction: "rtl" }}
        >
          <p className="font-display text-[0.95rem] text-amber-100">{pin.name}</p>
          {pin.controllerFaction && (
            <p className="text-[0.64rem] text-amber-300/80">בשליטת {pin.controllerFaction.name}</p>
          )}
        </div>
      </Tooltip>

      {/* ── Popup ───────────────────────────────────────── */}
      <Popup
        className="map-location-popup"
        autoPan
        keepInView
        autoPanPaddingTopLeft={[96, 108]}
        autoPanPaddingBottomRight={[96, 152]}
        offset={tooltipOffset}
        maxWidth={260}
        minWidth={188}
        closeButton
      >
        <div
          dir="rtl"
          className="space-y-1.5 min-w-max whitespace-nowrap text-right"
          style={{ whiteSpace: "nowrap", direction: "rtl" }}
        >
          <p className="whitespace-nowrap font-display text-lg leading-none text-amber-100">{pin.name}</p>
          <p className="whitespace-nowrap text-[0.65rem] text-stone-400 tracking-wide">{pin.region}</p>
          {pin.controllerFaction && (
            <p className="whitespace-nowrap text-[0.7rem] text-amber-300/80">
              מוקד כוח משויך: {pin.controllerFaction.name}
            </p>
          )}
          <p className="max-w-[14rem] whitespace-normal text-xs leading-6 text-stone-300 pt-0.5">
            {pin.summary}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

/* ─── Map view controller (DO NOT CHANGE — uses existing coordinate data) ── */
function MapViewController({ focusPoint }: { focusPoint: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(MAP_BOUNDS, { animate: false, padding: [96, 120] });
    map.invalidateSize();
  }, [map]);

  useEffect(() => {
    if (!focusPoint) return;
    map.flyTo(focusPoint, 0.6, { animate: true, duration: 0.8 });
    map.panInside(focusPoint, {
      paddingTopLeft:     L.point(96, 108),
      paddingBottomRight: L.point(96, 152),
      animate: true,
    });
  }, [focusPoint, map]);

  return null;
}

/* ─── Main canvas component ─────────────────────────────────────────────── */
export function FantasyMapCanvas({ pins, focusLocationId }: FantasyMapCanvasProps) {
  const focusPoint = useMemo(() => {
    if (!focusLocationId) return null;
    const pin = pins.find((p) => p.id === focusLocationId);
    return pin ? toMapPoint(pin.topPercent, pin.leftPercent) : null;
  }, [focusLocationId, pins]);

  return (
    <div dir="ltr" className="ltr relative h-full w-full">
      {/* Inner wrapper — carries the parchment vignette via CSS class */}
      <div className="map-parchment-container relative h-full w-full overflow-hidden rounded-[inherit] bg-stone-950">

        <MapContainer
          className="ltr h-full w-full"
          crs={L.CRS.Simple}
          bounds={MAP_BOUNDS}
          attributionControl={false}
          zoomControl
          minZoom={-1.5}
          maxZoom={2}
          zoomSnap={0.25}
          wheelPxPerZoomLevel={120}
          scrollWheelZoom="center"
        >
          <MapViewController focusPoint={focusPoint} />
          <ImageOverlay url="/images/world-map.jpg" bounds={MAP_BOUNDS} className="select-none" />
          {pins.map((pin) => (
            <MapLocationMarker key={pin.id} pin={pin} />
          ))}
        </MapContainer>

        {/*
          Parchment corner-fade overlay.
          Sits above the map tiles but BELOW Leaflet's marker / tooltip / popup panes.
          Because this is a sibling to the Leaflet container in the regular DOM,
          it is rendered within this parent's stacking context; its z-index
          does not interfere with Leaflet's internal pane z-indices.
          pointer-events: none ensures map interaction is fully preserved.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background: `
              radial-gradient(ellipse 120% 100% at 50% 50%,
                transparent 48%,
                rgba(6, 4, 3, 0.62) 82%,
                rgba(6, 4, 3, 0.85) 100%
              )
            `,
            zIndex: 9999,
          }}
        />

        {/* Subtle amber inner-glow along the very top of the map — "parchment light" */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[18%] rounded-t-[inherit]"
          style={{
            background: "linear-gradient(to bottom, rgba(205,164,94,0.06), transparent)",
            zIndex: 9999,
          }}
        />

      </div>
    </div>
  );
}
