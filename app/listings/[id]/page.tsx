"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  SearchX,
  Phone,
  MessageCircle,
} from "lucide-react";
import { getListing, ListingResponse } from "@/lib/api/listings";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";

type ViewState = "loading" | "normal" | "error" | "not-found";

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPropertyType(
  propertyType: ListingResponse["property_type"],
): string {
  switch (propertyType) {
    case "flat":
      return "Flat";

    case "house_land":
      return "House / Land";

    default:
      return propertyType;
  }
}

function getRoomNumber(
  rooms: Record<string, unknown> | null,
  key: string,
): number | null {
  if (!rooms) {
    return null;
  }

  const value = rooms[key];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return null;
}

function formatNumber(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return value.toLocaleString("en-IN");
}

function getAmenities(amenities: Record<string, unknown> | null): string[] {
  if (!amenities) {
    return [];
  }

  const items = amenities.items;

  if (Array.isArray(items)) {
    return items
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return Object.entries(amenities)
    .filter(([, value]) => {
      return value === true || typeof value === "string";
    })
    .map(([key, value]) => {
      if (typeof value === "string" && value.trim()) {
        return value;
      }

      return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    });
}

function getApiStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const possibleError = error as {
    status?: number;
    statusCode?: number;
    response?: {
      status?: number;
    };
  };

  return (
    possibleError.status ??
    possibleError.statusCode ??
    possibleError.response?.status ??
    null
  );
}

function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Couldn't load this property.";
}

function LoadingState() {
  return (
    <>
      <AppHeader />
      <main className="bg-surface-soft min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-6 w-44 animate-pulse rounded-lg bg-zinc-200" />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-8 w-3/4 animate-pulse rounded-lg bg-zinc-200" />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="border-border h-24 animate-pulse rounded-xl border bg-zinc-100"
                  />
                ))}
              </div>

              <div className="border-border h-32 animate-pulse rounded-xl border bg-zinc-100" />

              <div className="border-border h-40 animate-pulse rounded-xl border bg-zinc-100" />
            </div>

            <div className="border-border h-56 animate-pulse rounded-xl border bg-zinc-100" />
          </div>
        </div>
      </main>
    </>
  );
}

function NotFoundState() {
  return (
    <>
      <AppHeader />
      <main className="bg-surface-soft flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="bg-surface border-border w-full max-w-md rounded-2xl border p-8 text-center shadow-sm">
          <div className="text-text-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <SearchX className="h-6 w-6" />
          </div>

          <h1 className="text-text-primary text-2xl font-bold tracking-tight">
            Property not found
          </h1>

          <p className="text-text-secondary mt-2 text-sm">
            This listing may have been sold or taken down.
          </p>

          <div className="mt-6">
            <Link
              href="/customer"
              className="bg-accent hover:bg-accent-hover inline-flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors"
            >
              Browse other properties
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function ErrorState({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <>
      <AppHeader />
      <main className="bg-surface-soft flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="bg-surface border-border w-full max-w-md rounded-2xl border p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle className="h-6 w-6" />
          </div>

          <h1 className="text-text-primary text-2xl font-bold tracking-tight">
            Couldn&apos;t load this property
          </h1>

          <p className="text-text-secondary mt-2 text-sm">{message}</p>

          <div className="mt-6">
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="bg-accent hover:bg-accent-hover inline-flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors disabled:opacity-75"
            >
              {isRetrying ? (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Retrying…
                </span>
              ) : (
                "Try again"
              )}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [property, setProperty] = useState<ListingResponse | null>(null);

  const [viewState, setViewState] = useState<ViewState>("loading");

  const [errorMessage, setErrorMessage] = useState(
    "Check your connection and try again.",
  );

  const [isRetrying, setIsRetrying] = useState(false);

  const listingId = Number(resolvedParams.id);

  const loadProperty = useCallback(async () => {
    if (!Number.isInteger(listingId) || listingId <= 0) {
      setProperty(null);
      setViewState("not-found");
      return;
    }

    setViewState("loading");
    setErrorMessage("Check your connection and try again.");

    try {
      const data = await getListing(listingId);

      setProperty(data);
      setViewState("normal");
    } catch (error) {
      const status = getApiStatus(error);

      if (status === 404) {
        setProperty(null);
        setViewState("not-found");
        return;
      }

      setProperty(null);
      setErrorMessage(getApiErrorMessage(error));
      setViewState("error");
    }
  }, [listingId]);

  useEffect(() => {
    void loadProperty();
  }, [loadProperty]);

  const handleTryAgain = async () => {
    setIsRetrying(true);

    try {
      await loadProperty();
    } finally {
      setIsRetrying(false);
    }
  };

  if (viewState === "loading") {
    return <LoadingState />;
  }

  if (viewState === "not-found") {
    return <NotFoundState />;
  }

  if (viewState === "error") {
    return (
      <ErrorState
        message={errorMessage}
        onRetry={handleTryAgain}
        isRetrying={isRetrying}
      />
    );
  }

  if (!property) {
    return null;
  }

  const bedrooms = getRoomNumber(property.rooms, "bedrooms");
  const bathrooms = getRoomNumber(property.rooms, "bathrooms");

  const pricePerSqft =
    property.carpet_area && property.carpet_area > 0
      ? Math.round(property.price / property.carpet_area)
      : null;

  const amenities = getAmenities(property.amenities);

  return (
    <>
      <AppHeader />
      <main className="bg-surface-soft min-h-[calc(100vh-4rem)] pb-28 lg:pb-8">
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-text-secondary hover:text-text-primary group inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div>
                <h1 className="text-text-primary text-2xl font-bold tracking-tight sm:text-3xl">
                  {property.title}
                </h1>

                <div className="mt-2">
                  <span className="bg-accent-soft text-accent border-accent-border/30 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    {formatPropertyType(property.property_type)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {[
                  {
                    label: "Bedrooms",
                    value: bedrooms ?? "—",
                  },
                  {
                    label: "Bathrooms",
                    value: bathrooms ?? "—",
                  },
                  {
                    label: "Carpet area",
                    value:
                      property.carpet_area !== null
                        ? `${formatNumber(property.carpet_area)} sq ft`
                        : "—",
                  },
                  {
                    label: "Floor",
                    value: property.floor_number ?? "—",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-surface border-border rounded-xl border p-4 text-center"
                  >
                    <div className="text-text-primary text-lg font-bold sm:text-xl">
                      {item.value}
                    </div>

                    <div className="text-text-secondary mt-1 text-xs font-medium">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <section>
                <h2 className="text-text-primary mb-2 text-lg font-bold tracking-tight">
                  Description
                </h2>

                <p className="text-text-secondary text-base leading-relaxed">
                  {property.description || "No description available."}
                </p>
              </section>

              <section>
                <h2 className="text-text-primary mb-3 text-lg font-bold tracking-tight">
                  Details
                </h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: "Built-up area",
                      value:
                        property.built_up_area !== null
                          ? `${formatNumber(property.built_up_area)} sq ft`
                          : "—",
                    },
                    {
                      label: "Plot area",
                      value:
                        property.plot_area !== null
                          ? `${formatNumber(property.plot_area)} sq ft`
                          : "—",
                    },
                    {
                      label: "Price per sq ft",
                      value:
                        pricePerSqft !== null
                          ? `₹${formatNumber(pricePerSqft)}`
                          : "—",
                    },
                    {
                      label: "Property type",
                      value: formatPropertyType(property.property_type),
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="bg-surface border-border flex items-center justify-between rounded-xl border p-3.5"
                    >
                      <span className="text-text-secondary text-sm font-medium">
                        {row.label}
                      </span>

                      <span className="text-text-primary text-sm font-semibold">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-text-primary mb-3 text-lg font-bold tracking-tight">
                  Amenities
                </h2>

                {amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="bg-surface border-border text-text-primary inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm">
                    No amenities listed for this property.
                  </p>
                )}
              </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <div className="bg-surface border-border rounded-2xl border p-5 shadow-sm">
                <div className="text-accent text-2xl font-extrabold tracking-tight">
                  {formatINR(property.price)}
                </div>

                {pricePerSqft !== null && (
                  <div className="text-text-secondary mt-0.5 text-xs">
                    ₹{formatNumber(pricePerSqft)} / sq ft
                  </div>
                )}

                <div className="border-border mt-5 flex flex-col gap-2.5 border-t pt-5">
                  <button
                    type="button"
                    className="bg-accent hover:bg-accent-hover shadow-accent/20 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Contact Broker
                  </button>

                  <button
                    type="button"
                    className="text-text-primary bg-surface border-border hover:bg-surface-soft inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat About This Property
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div className="bg-surface border-border fixed inset-x-0 bottom-0 flex gap-2.5 border-t p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden">
          <button
            type="button"
            className="bg-accent inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white"
          >
            <Phone className="h-4 w-4" />
            Call
          </button>

          <button
            type="button"
            className="text-text-primary bg-surface border-border inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold"
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </button>
        </div>
      </main>
    </>
  );
}
