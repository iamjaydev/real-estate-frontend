"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  SearchX,
  Phone,
  MessageCircle,
} from "lucide-react";

const mockProperty = {
  id: 101,
  title: "2BHK Apartment in Adajan",
  description: "Spacious flat near main road",
  price: 4500000,
  property_type: "flat",
  lat: 21.1702,
  lng: 72.8311,
  carpet_area: 900,
  built_up_area: 1100,
  floor_number: 3,
  rooms: { bedrooms: 2, bathrooms: 2 },
  amenities: ["Parking", "Lift", "24/7 Security"],
};

type ViewState = "normal" | "loading" | "error" | "not-found";

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PropertyDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ state?: string }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;

  const initialParam = resolvedParams.id;
  const stateQuery = resolvedSearchParams?.state as ViewState | undefined;

  const getInitialState = (): ViewState => {
    if (
      stateQuery &&
      ["normal", "loading", "error", "not-found"].includes(stateQuery)
    ) {
      return stateQuery;
    }
    if (initialParam === "loading") return "loading";
    if (initialParam === "error") return "error";
    if (initialParam === "not-found" || initialParam === "404")
      return "not-found";
    return "normal";
  };

  const [viewState, setViewState] = useState<ViewState>(getInitialState);
  const [isRetrying, setIsRetrying] = useState(false);

  const property = mockProperty;

  const handleTryAgain = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      setViewState("normal");
    }, 400);
  };

  const pricePerSqft = Math.round(property.price / property.carpet_area);

  if (viewState === "loading") {
    return (
      <main className="bg-surface-soft min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-6 w-44 animate-pulse rounded-lg bg-zinc-200" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-8 w-3/4 animate-pulse rounded-lg bg-zinc-200" />
              <div className="border-border h-24 animate-pulse rounded-xl border bg-zinc-100" />
              <div className="border-border h-40 animate-pulse rounded-xl border bg-zinc-100" />
            </div>
            <div className="border-border h-56 animate-pulse rounded-xl border bg-zinc-100" />
          </div>
        </div>
      </main>
    );
  }

  if (viewState === "not-found") {
    return (
      <main className="bg-surface-soft flex min-h-screen items-center justify-center p-4">
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
    );
  }

  if (viewState === "error") {
    return (
      <main className="bg-surface-soft flex min-h-screen items-center justify-center p-4">
        <div className="bg-surface border-border w-full max-w-md rounded-2xl border p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-text-primary text-2xl font-bold tracking-tight">
            Couldn&apos;t load this property
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            Check your connection and try again.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleTryAgain}
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
    );
  }

  return (
    <main className="bg-surface-soft min-h-screen pb-28 lg:pb-8">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/customer"
          className="text-text-secondary hover:text-text-primary group inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to properties
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h1 className="text-text-primary text-2xl font-bold tracking-tight sm:text-3xl">
                {property.title}
              </h1>
              <div className="mt-2">
                <span className="bg-accent-soft text-accent border-accent-border/30 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize">
                  {property.property_type}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {[
                { label: "Bedrooms", value: property.rooms.bedrooms },
                { label: "Bathrooms", value: property.rooms.bathrooms },
                {
                  label: "Carpet area",
                  value: `${property.carpet_area} sq ft`,
                },
                { label: "Floor", value: property.floor_number },
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
                {property.description}
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
                    value: `${property.built_up_area.toLocaleString("en-IN")} sq ft`,
                  },
                  {
                    label: "Price per sq ft",
                    value: `₹${pricePerSqft.toLocaleString("en-IN")}`,
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
              <div className="flex flex-wrap gap-2.5">
                {property.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="bg-surface border-border text-text-primary inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-surface border-border rounded-2xl border p-5 shadow-sm">
              <div className="text-accent text-2xl font-extrabold tracking-tight">
                {formatINR(property.price)}
              </div>
              <div className="text-text-secondary mt-0.5 text-xs">
                ₹{pricePerSqft.toLocaleString("en-IN")} / sq ft
              </div>

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
  );
}
