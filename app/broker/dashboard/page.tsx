"use client";

import Link from "next/link";

export default function BrokerDashboardPage() {
  const totalListings = 0;
  const totalLeads = 0;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/broker" className="text-lg font-semibold tracking-tight">
            Reality AI
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium">
              JB
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-500">
              Broker Dashboard
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, John
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Create and manage your property listings with Reality AI.
            </p>
          </div>

          <Link
            href="/broker/listings/create"
            className="bg-accent hover:bg-accent/90 inline-flex h-11 shrink-0 items-center justify-center rounded-lg px-5 text-sm font-medium text-white transition"
          >
            + Add Listing
          </Link>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Total Listings</p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {totalListings}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Properties you have listed
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Total Leads</p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {totalLeads}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Leads generated from your listings
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
            +
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            Start by adding a listing
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Add your first property to make it discoverable through Reality AI.
          </p>

          <Link
            href="/broker/listings/create"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium transition hover:bg-slate-50"
          >
            Add your first listing
          </Link>
        </section>
      </div>
    </main>
  );
}
