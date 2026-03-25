"use client";

import { useEffect } from "react";
import type { LatLngBoundsExpression } from "leaflet";
import L from "leaflet";
import { ImageOverlay, MapContainer, Marker, Popup, Tooltip, useMap } from "react-leaflet";

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
}

interface FantasyMapCanvasProps {
  pins: FantasyMapPin[];
}

function MapBoundsController() {
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

  return null;
}

function toMapPoint(topPercent: number, leftPercent: number): [number, number] {
  return [(MAP_IMAGE_HEIGHT * topPercent) / 100, (MAP_IMAGE_WIDTH * leftPercent) / 100];
}

function createMarkerIcon(isPrimary: boolean) {
  const markerSize = 24;
  const iconAnchorX = 12;
  const iconAnchorY = 24;
  const glyphSize = isPrimary ? 12 : 11;

  return L.divIcon({
    className: "map-location-marker-shell",
    iconSize: [markerSize, markerSize],
    iconAnchor: [iconAnchorX, iconAnchorY],
    tooltipAnchor: [0, -iconAnchorY],
    popupAnchor: [0, -iconAnchorY + 4],
    html: `
      <span class="map-location-marker${isPrimary ? " is-primary" : ""}" aria-hidden="true">
        <span class="map-location-marker__core">
          <svg viewBox="0 0 24 24" width="${glyphSize}" height="${glyphSize}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">
            <path d="M4 20V8h3V5h3v3h4V5h3v3h3v12" />
            <path d="M9 20v-4h6v4" />
            <path d="M7.5 11.5h.01" />
            <path d="M12 11.5h.01" />
            <path d="M16.5 11.5h.01" />
          </svg>
        </span>
        <span class="map-location-marker__tip"></span>
      </span>
    `,
  });
}

export function FantasyMapCanvas({ pins }: FantasyMapCanvasProps) {
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
        <MapBoundsController />

        <ImageOverlay url="/images/world-map.jpg" bounds={MAP_BOUNDS} className="select-none" />

        {pins.map((pin) => {
          const center = toMapPoint(pin.topPercent, pin.leftPercent);

          return (
            <Marker
              key={pin.id}
              position={center}
              icon={createMarkerIcon(pin.isPrimary)}
            >
              <Tooltip className="map-location-tooltip" direction="top" offset={[0, -15]} opacity={1}>
                <div dir="rtl" className="text-right">
                  {pin.name}
                </div>
              </Tooltip>
              <Popup className="map-location-popup" autoPan closeButton>
                <div dir="rtl" className="space-y-1 text-right">
                  <p className="font-display text-lg leading-none text-ink">{pin.name}</p>
                  <p className="text-[0.68rem] text-muted">{pin.region}</p>
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
