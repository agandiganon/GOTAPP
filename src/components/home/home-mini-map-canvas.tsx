"use client";

/**
 * HomeMiniMapCanvas
 *
 * A lightweight, interaction-disabled Leaflet map used exclusively on the
 * Home screen's "Episode Battlefield" widget.  The map is centred and zoomed
 * specifically on the primary location for the current episode; the user
 * cannot pan or scroll it.
 *
 * Props
 *  center       – [y, x] in image-pixel space (CRS.Simple, same coordinate
 *                 system as the full FantasyMapCanvas).  Pass the output of
 *                 toMapPoint(pin.topPercent, pin.leftPercent).
 *  markerColor  – CSS colour string for the pulsing beacon dot.
 */

import { useEffect } from "react";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import L from "leaflet";
import { ImageOverlay, MapContainer, Marker, useMap } from "react-leaflet";

/* ── Shared map geometry — must match fantasy-map-canvas.tsx ──────────────── */
const MAP_IMAGE_WIDTH  = 1409;
const MAP_IMAGE_HEIGHT = 944;
const MAP_BOUNDS: LatLngBoundsExpression = [
  [0, 0],
  [MAP_IMAGE_HEIGHT, MAP_IMAGE_WIDTH],
];

/* ── Zoom level for the mini-map (higher = more zoomed in) ───────────────── */
const MINI_ZOOM = 0.6;

/* ── Beacon marker icon ───────────────────────────────────────────────────── */
function createBeaconIcon(color: string) {
  return L.divIcon({
    className: "",
    iconSize:   [20, 20],
    iconAnchor: [10, 10],
    html: `
      <div style="
        position: relative;
        width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center;
      ">
        <!-- outer glow ring -->
        <div style="
          position: absolute;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: ${color}33;
          animation: mini-beacon-pulse 1.8s ease-out infinite;
        "></div>
        <!-- inner solid dot -->
        <div style="
          position: relative;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid rgba(255,252,240,0.90);
          box-shadow: 0 0 0 3px ${color}44, 0 2px 8px rgba(0,0,0,0.55);
        "></div>
      </div>
    `,
  });
}

/* ── Sub-component: force the map to the correct center after mount ───────── */
function MapCenterer({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: false });
    map.invalidateSize();
  }, [map, center, zoom]);

  return null;
}

/* ── Public component ─────────────────────────────────────────────────────── */
interface HomeMiniMapCanvasProps {
  /** [y, x] in Leaflet CRS.Simple image-pixel coordinates */
  center: [number, number];
  markerColor: string;
}

export function HomeMiniMapCanvas({ center, markerColor }: HomeMiniMapCanvasProps) {
  const beaconIcon = createBeaconIcon(markerColor);

  return (
    <>
      {/* keyframe for the pulsing beacon ring */}
      <style>{`
        @keyframes mini-beacon-pulse {
          0%   { transform: scale(1);   opacity: 0.70; }
          60%  { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>

      <MapContainer
        className="ltr h-full w-full"
        crs={L.CRS.Simple}
        center={center}
        zoom={MINI_ZOOM}
        minZoom={MINI_ZOOM}
        maxZoom={MINI_ZOOM}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
        attributionControl={false}
      >
        <MapCenterer center={center} zoom={MINI_ZOOM} />
        <ImageOverlay
          url="/images/world-map.jpg"
          bounds={MAP_BOUNDS}
          className="select-none"
        />
        <Marker position={center} icon={beaconIcon} />
      </MapContainer>
    </>
  );
}
