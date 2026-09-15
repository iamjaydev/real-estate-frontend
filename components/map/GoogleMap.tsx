"use client";

import {
  APIProvider,
  AdvancedMarker,
  Map,
} from "@vis.gl/react-google-maps";


const DEFAULT_CENTER = {
  lat: 21.1702,
  lng: 72.8311,
};

const DEFAULT_ZOOM = 13;

const PROPERTIES = [
  {
    id: "property-1",
    name: "3 BHK Apartment in Vesu",
    position: {
      lat: 21.1702,
      lng: 72.8311,
    },
  },
  {
    id: "property-2",
    name: "Luxury Villa in Vesu",
    position: {
      lat: 21.176,
      lng: 72.84,
    },
  },
  {
    id: "property-3",
    name: "2 BHK Apartment",
    position: {
      lat: 21.164,
      lng: 72.825,
    },
  },
  {
    id: "property-4",
    name: "Premium Flat",
    position: {
      lat: 21.168,
      lng: 72.846,
    },
  },
  {
    id: "property-5",
    name: "Modern Apartment",
    position: {
      lat: 21.181,
      lng: 72.833,
    },
  },
];

export default function GoogleMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Google Maps API key is missing.
      </div>
    );
  }

  if (!mapId) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Google Maps Map ID is missing.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId={mapId}
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI
        className="h-full w-full"
      >
        {PROPERTIES.map((property) => (
          <AdvancedMarker
            key={property.id}
            position={property.position}
            title={property.name}
          >
            <div className="relative flex size-11 items-center justify-center">
              {/* Marker circle */}
              <div className="flex size-11 items-center justify-center rounded-full border-4 border-white bg-accent text-white shadow-lg">
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

              {/* Pin pointer */}
              <div className="absolute -bottom-1 h-3 w-3 rotate-45 border-r-4 border-b-4 border-white bg-accent" />
            </div>
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}