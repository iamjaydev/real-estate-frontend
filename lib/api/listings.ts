import { apiClient } from "./client";

export type BackendPropertyType = "flat" | "house_land";

export interface CreateListingRequest {
  title: string;
  description: string | null;
  price: number;
  property_type: BackendPropertyType;
  carpet_area: number | null;
  built_up_area: number | null;
  plot_area: number | null;
  floor_number: number | null;
  rooms: Record<string, unknown> | null;
  lat: number;
  lng: number;
}

export interface ListingResponse {
  id: number;
  title: string;
  description: string | null;
  price: number;
  property_type: BackendPropertyType;
  carpet_area: number | null;
  built_up_area: number | null;
  plot_area: number | null;
  floor_number: number | null;
  rooms: Record<string, unknown> | null;
  lat: number;
  lng: number;
  broker_id: number;
  amenities: Record<string, unknown> | null;
  created_at: string;
}

export function createListing(
  data: CreateListingRequest,
): Promise<ListingResponse> {
  return apiClient("/listings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getListing(listingId: number): Promise<ListingResponse> {
  return apiClient(`/listings/${listingId}`, {
    method: "GET",
  });
}
