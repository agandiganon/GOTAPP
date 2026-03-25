"use client";

import { useEffect, useMemo } from "react";
import type { LatLngBoundsExpression } from "leaflet";
import L from "leaflet";
import { ImageOverlay, MapContainer, Marker, Popup, Tooltip, useMap } from "react-leaflet";

import type { MapPinKind } from "@/lib/map-presentation";

export const MAP_IMAGE_WIDTH = 1409;
export const MAP_IMAGE_HEIGHT = 944;

const MAP_BOUNDS: LatLngBoundsExpression = [
  [0, 0],
  [MAP_IMAGE_HEIGHT, MAP_IMAGE_WIDTH],
];

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

function toMapPoint(topPercent: number, leftPercent: number): [number, number] {
  return [(MAP_IMAGE_HEIGHT * topPercent) / 100, (MAP_IMAGE_WIDTH * leftPercent) / 100];
}

function createGlyphMarkup(kind: MapPinKind) {
  if (kind === "stronghold") {
    return `
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">
        <path d="M4 20V8h3V5h3v3h4V5h3v3h3v12" />
        <path d="M9 20v-4h6v4" />
        <path d="M7.5 11.5h.01" />
        <path d="M12 11.5h.01" />
        <path d="M16.5 11.5h.01" />
      </svg>
    `;
  }

  if (kind === "city") {
    return `
      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">
        <path d="M12 3l6 6-6 12L6 9l6-6Z" />
        <path d="M12 7.5v5" />
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">
      <path d="m12 4 7 8-7 8-7-8 7-8Z" />
    </svg>
  `;
}

function createFactionBadgeMarkup(controllerFaction: FantasyMapPin["controllerFaction"]) {
  if (!controllerFaction) {
    return "";
  }

  if (controllerFaction.sigilUrl) {
    const safeUrl = encodeURI(controllerFaction.sigilUrl)
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
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">
        <path d="M12 3.5 18 6v5c0 4-2.7 7-6 9-3.3-2-6-5-6-9V6l6-2.5Z" />
      </svg>
    </span>
  `;
}

function createMarkerIcon(pin: FantasyMapPin) {
  const iconWidth = 28;
  const iconHeight = 34;
  const iconAnchorX = 14;
  const iconAnchorY = 30;

  return L.divIcon({
    className: "map-location-marker-shell",
    iconSize: [iconWidth, iconHeight],
    iconAnchor: [iconAnchorX, iconAnchorY],
    tooltipAnchor: [0, -24],
    popupAnchor: [0, -20],
    html: `
      <span class="map-location-marker${pin.isPrimary ? " is-primary" : ""}${pin.isFocused ? " is-focused" : ""}${pin.controllerFaction ? " has-faction" : ""}" aria-hidden="true" style="--marker-tone:${pin.controllerFaction?.themeColor ?? "#cba55c"};">
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

function MapViewController({
  focusPoint,
}: {
  focusPoint: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(MAP_BOUNDS, {
      animate: false,
      padding: [20, 20],
    });
    map.setMaxBounds([
      [-80, -120],
      [MAP_IMAGE_HEIGHT + 80, MAP_IMAGE_WIDTH + 120],
    ]);
    map.invalidateSize();
  }, [map]);

  useEffect(() => {
    if (!focusPoint) {
      return;
    }

    map.flyTo(focusPoint, 0.6, {
      animate: true,
      duration: 0.8,
    });
  }, [focusPoint, map]);

  return null;
}

export function FantasyMapCanvas({ pins, focusLocationId }: FantasyMapCanvasProps) {
  const focusPoint = useMemo(() => {
    if (!focusLocationId) {
      return null;
    }

    const pin = pins.find((candidate) => candidate.id === focusLocationId);
    return pin ? toMapPoint(pin.topPercent, pin.leftPercent) : null;
  }, [focusLocationId, pins]);

  return (
    <div dir="ltr" className="ltr relative h-full w-full">
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
        maxBoundsViscosity={1}
      >
        <MapViewController focusPoint={focusPoint} />
        <ImageOverlay url="/images/world-map.jpg" bounds={MAP_BOUNDS} className="select-none" />

        {pins.map((pin) => {
          const center = toMapPoint(pin.topPercent, pin.leftPercent);

          return (
            <Marker key={pin.id} position={center} icon={createMarkerIcon(pin)}>
              <Tooltip className="map-location-tooltip" direction="top" offset={[0, -16]} opacity={1}>
                <div dir="rtl" className="space-y-0.5 text-right">
                  <p className="font-medium text-ink">{pin.name}</p>
                  {pin.controllerFaction ? (
                    <p className="text-[0.66rem] text-accent">בשליטת {pin.controllerFaction.name}</p>
                  ) : null}
                </div>
              </Tooltip>
              <Popup className="map-location-popup" autoPan closeButton>
                <div dir="rtl" className="space-y-1.5 text-right">
                  <p className="font-display text-lg leading-none text-ink">{pin.name}</p>
                  <p className="text-[0.68rem] text-muted">{pin.region}</p>
                  {pin.controllerFaction ? (
                    <p className="text-[0.72rem] text-accent">מוקד כוח משויך: {pin.controllerFaction.name}</p>
                  ) : null}
                  <p className="text-xs leading-6 text-[#d8d2c7]">{pin.summary}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
