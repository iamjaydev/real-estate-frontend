"use client";

import { useEffect, useMemo } from "react";
import { APIProvider, AdvancedMarker, Map, useMap } from "@vis.gl/react-google-maps";
import { Listing } from "@/lib/api/chat";

const DEFAULT_CENTER = {
  lat: 21.1702,
  lng: 72.8311,
};

const DEFAULT_ZOOM = 13;

interface GoogleMapProps {
  listings?: Listing[];
}

function getCoordinates(property: any) {
  const lat = property.lat ?? property.location?.lat;
  const lng = property.lng ?? property.location?.lng;

  if (typeof lat === "number" && typeof lng === "number") {
    return { lat, lng };
  }
  return null;
}

function getAverageCenter(listings: Listing[]) {
  const validCoords = listings
    .map(getCoordinates)
    .filter((coords): coords is { lat: number; lng: number } => coords !== null);

  if (validCoords.length === 0) return DEFAULT_CENTER;

  const sum = validCoords.reduce(
    (acc, curr) => ({
      lat: acc.lat + curr.lat,
      lng: acc.lng + curr.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / validCoords.length,
    lng: sum.lng / validCoords.length,
  };
}

function MapPanControl({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, center]);

  return null;
}

export default function GoogleMap({ listings = [] }: GoogleMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  const center = useMemo(() => getAverageCenter(listings), [listings]);

  if (!apiKey || !mapId) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Google Maps API configuration missing.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId={mapId}
        defaultCenter={center}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI
        className="h-full w-full"
      >
        <MapPanControl center={center} />

        {listings.map((property, index) => {
          const coords = getCoordinates(property);
          if (!coords) return null;

          return (
            <AdvancedMarker
              key={`${property.id}-${index}`}
              position={coords}
              title={property.title}
            >
              <div className="relative flex size-11 items-center justify-center">
                <div className="bg-accent flex size-11 items-center justify-center rounded-full border-4 border-white text-white shadow-lg">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 11.5 12 4l9 7.5" />
                    <path d="M5.5 10.5V20h13v-9.5" />
                    <path d="M9.5 20v-5h5v5" />
                  </svg>
                </div>
                <div className="bg-accent absolute -bottom-1 h-3 w-3 rotate-45 border-r-4 border-b-4 border-white" />
              </div>
            </AdvancedMarker>
          );
        })}
      </Map>
    </APIProvider>
  );
}
