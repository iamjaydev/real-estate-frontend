"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import {
  Building2,
  Home,
  MapPin,
  Layers,
  BedDouble,
  Bath,
  Maximize2,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Loader2,
  FileText,
  Compass,
} from "lucide-react";

export type PropertyType = "Flat" | "House / Land" | "";

export interface CreateListingFormData {
  title: string;
  description: string;
  propertyType: PropertyType;
  price: string;
  bedrooms: string;
  bathrooms: string;
  floorNumber: string;
  carpetArea: string;
  builtUpArea: string;
  latitude: string;
  longitude: string;
}

export interface FormErrors {
  title?: string;
  description?: string;
  propertyType?: string;
  price?: string;
  bedrooms?: string;
  bathrooms?: string;
  floorNumber?: string;
  carpetArea?: string;
  builtUpArea?: string;
  latitude?: string;
  longitude?: string;
}

const INITIAL_FORM_DATA: CreateListingFormData = {
  title: "",
  description: "",
  propertyType: "",
  price: "",
  bedrooms: "",
  bathrooms: "",
  floorNumber: "",
  carpetArea: "",
  builtUpArea: "",
  latitude: "",
  longitude: "",
};

export default function BrokerCreateListingPage() {
  const [formData, setFormData] =
    useState<CreateListingFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof CreateListingFormData, boolean>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] =
    useState<CreateListingFormData | null>(null);

  const validateField = (
    name: keyof CreateListingFormData,
    value: string,
    allData: CreateListingFormData = formData
  ): string | undefined => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Property title is required";
        if (value.trim().length < 5)
          return "Title must be at least 5 characters";
        return undefined;

      case "description":
        if (!value.trim()) return "Description is required";
        if (value.trim().length < 20)
          return "Description must be at least 20 characters";
        return undefined;

      case "propertyType":
        if (!value) return "Please select a property type";
        if (value !== "Flat" && value !== "House / Land")
          return "Invalid property type";
        return undefined;

      case "price": {
        if (!value) return "Price is required";
        const priceNum = Number(value);
        if (isNaN(priceNum) || priceNum <= 0)
          return "Please enter a valid positive price";
        return undefined;
      }

      case "bedrooms": {
        if (!value) return "Number of bedrooms is required";
        const beds = Number(value);
        if (isNaN(beds) || beds < 0 || !Number.isInteger(beds))
          return "Please enter a valid number of bedrooms";
        return undefined;
      }

      case "bathrooms": {
        if (!value) return "Number of bathrooms is required";
        const baths = Number(value);
        if (isNaN(baths) || baths < 0 || !Number.isInteger(baths))
          return "Please enter a valid number of bathrooms";
        return undefined;
      }

      case "floorNumber": {
        if (!value && value !== "0") return "Floor number is required";
        const floor = Number(value);
        if (isNaN(floor) || !Number.isInteger(floor))
          return "Please enter a valid floor number";
        return undefined;
      }

      case "carpetArea": {
        if (!value) return "Carpet area is required";
        const carpet = Number(value);
        if (isNaN(carpet) || carpet <= 0)
          return "Please enter a valid carpet area in sq ft";
        return undefined;
      }

      case "builtUpArea": {
        if (!value) return "Built-up area is required";
        const builtUp = Number(value);
        if (isNaN(builtUp) || builtUp <= 0)
          return "Please enter a valid built-up area in sq ft";
        if (
          allData.carpetArea &&
          builtUp < Number(allData.carpetArea)
        ) {
          return "Built-up area cannot be less than carpet area";
        }
        return undefined;
      }

      case "latitude": {
        if (!value) return "Latitude is required";
        const lat = Number(value);
        if (isNaN(lat) || lat < -90 || lat > 90)
          return "Latitude must be between -90 and 90";
        return undefined;
      }

      case "longitude": {
        if (!value) return "Longitude is required";
        const lng = Number(value);
        if (isNaN(lng) || lng < -180 || lng > 180)
          return "Longitude must be between -180 and 180";
        return undefined;
      }

      default:
        return undefined;
    }
  };

  const validateForm = (data: CreateListingFormData): boolean => {
    const newErrors: FormErrors = {};
    (Object.keys(data) as Array<keyof CreateListingFormData>).forEach(
      (field) => {
        const error = validateField(field, data[field], data);
        if (error) {
          newErrors[field] = error;
        }
      }
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof CreateListingFormData;

    const updatedFormData = { ...formData, [fieldName]: value };
    setFormData(updatedFormData);

    // Re-validate field in real-time if it was touched
    if (touched[fieldName]) {
      const error = validateField(fieldName, value, updatedFormData);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    }

    // Also re-validate builtUpArea if carpetArea changes
    if (fieldName === "carpetArea" && touched.builtUpArea) {
      const builtUpError = validateField(
        "builtUpArea",
        formData.builtUpArea,
        updatedFormData
      );
      setErrors((prev) => ({ ...prev, builtUpArea: builtUpError }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof CreateListingFormData;

    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, value, formData);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Partial<Record<keyof CreateListingFormData, boolean>> =
      {};
    (Object.keys(formData) as Array<keyof CreateListingFormData>).forEach(
      (key) => {
        allTouched[key] = true;
      }
    );
    setTouched(allTouched);

    if (!validateForm(formData)) {
      // Scroll to the first error
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementById(firstErrorKey);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsLoading(true);

   
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmittedData({ ...formData });
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setTouched({});
    setIsSuccess(false);
    setSubmittedData(null);
  };

  const formatPrice = (val: string) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <main className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            <Link
              href="/broker"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Broker
            </Link>
            <span>/</span>
            <Link
              href="/broker/listings"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Listings
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-200">New Listing</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 inline-flex">
                  <Building2 className="w-6 h-6" />
                </span>
                Create New Listing
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Fill in the property details to publish a new real estate
                listing.
              </p>
            </div>

            <Link
              href="/broker/listings"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all w-fit shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Listings
            </Link>
          </div>
        </div>

        {/* Success State Card */}
        {isSuccess && submittedData && (
          <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800/60 shadow-xl shadow-emerald-500/5 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40 mb-1">
                  <Sparkles className="w-3 h-3" />
                  Mock Listing Created
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Listing Published Successfully!
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  The property details have been captured and are ready for
                  backend submission.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 text-sm">
              <div className="sm:col-span-2 md:col-span-4">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
                  Title
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white text-base">
                  {submittedData.title}
                </span>
              </div>

              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
                  Property Type
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {submittedData.propertyType}
                </span>
              </div>

              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
                  Price
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(submittedData.price)}
                </span>
              </div>

              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
                  Layout
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {submittedData.bedrooms} Bed · {submittedData.bathrooms} Bath
                </span>
              </div>

              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
                  Floor
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Floor {submittedData.floorNumber}
                </span>
              </div>

              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
                  Carpet Area
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {submittedData.carpetArea} sq ft
                </span>
              </div>

              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
                  Built-up Area
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {submittedData.builtUpArea} sq ft
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
                  Location (Lat, Long)
                </span>
                <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  {submittedData.latitude}, {submittedData.longitude}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                Create Another Listing
              </button>
              <Link
                href="/broker/listings"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md shadow-blue-500/20"
              >
                Go to Listings
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  1. Basic Information
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Provide essential headline and description of the property
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Property Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Elegant 3 BHK Apartment with Skyline View"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${
                      errors.title && touched.title
                        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-500"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    }`}
                    aria-invalid={Boolean(errors.title && touched.title)}
                    aria-describedby={errors.title ? "title-error" : undefined}
                  />
                </div>
                {errors.title && touched.title && (
                  <p
                    id="title-error"
                    className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-zinc-400">
                    {formData.description.length} characters
                  </span>
                </div>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Describe key highlights, architectural features, neighborhood advantages, and living spaces..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 resize-y min-h-[100px] ${
                    errors.description && touched.description
                      ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-500"
                      : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  }`}
                  aria-invalid={
                    Boolean(errors.description && touched.description)
                  }
                  aria-describedby={
                    errors.description ? "description-error" : undefined
                  }
                />
                {errors.description && touched.description && (
                  <p
                    id="description-error"
                    className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Property Details */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  2. Property Details
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Specify configuration, pricing, and structural attributes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="propertyType"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Property Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 cursor-pointer appearance-none ${
                      errors.propertyType && touched.propertyType
                        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-500"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    }`}
                    aria-invalid={
                      Boolean(errors.propertyType && touched.propertyType)
                    }
                    aria-describedby={
                      errors.propertyType ? "propertyType-error" : undefined
                    }
                  >
                    <option value="" disabled>
                      Select property type
                    </option>
                    <option value="Flat">Flat</option>
                    <option value="House / Land">House / Land</option>
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.propertyType && touched.propertyType && (
                  <p
                    id="propertyType-error"
                    className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.propertyType}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Price (INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 8500000"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${
                      errors.price && touched.price
                        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-500"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    }`}
                    aria-invalid={Boolean(errors.price && touched.price)}
                    aria-describedby={errors.price ? "price-error" : undefined}
                  />
                </div>
                {formData.price && !errors.price && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Formatted: {formatPrice(formData.price)}
                  </p>
                )}
                {errors.price && touched.price && (
                  <p
                    id="price-error"
                    className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.price}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="bedrooms"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Bedrooms <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <BedDouble className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    min="0"
                    max="50"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 3"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${
                      errors.bedrooms && touched.bedrooms
                        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-500"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    }`}
                    aria-invalid={
                      Boolean(errors.bedrooms && touched.bedrooms)
                    }
                    aria-describedby={
                      errors.bedrooms ? "bedrooms-error" : undefined
                    }
                  />
                </div>
                {errors.bedrooms && touched.bedrooms && (
                  <p
                    id="bedrooms-error"
                    className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.bedrooms}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="bathrooms"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Bathrooms <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Bath className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    min="0"
                    max="50"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 2"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${
                      errors.bathrooms && touched.bathrooms
                        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-500"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    }`}
                    aria-invalid={
                      Boolean(errors.bathrooms && touched.bathrooms)
                    }
                    aria-describedby={
                      errors.bathrooms ? "bathrooms-error" : undefined
                    }
                  />
                </div>
                {errors.bathrooms && touched.bathrooms && (
                  <p
                    id="bathrooms-error"
                    className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.bathrooms}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="floorNumber"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Floor Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    id="floorNumber"
                    name="floorNumber"
                    min="-5"
                    max="200"
                    value={formData.floorNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 5 (0 for Ground)"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${
                      errors.floorNumber && touched.floorNumber
                        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-500"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    }`}
                    aria-invalid={
                      Boolean(errors.floorNumber && touched.floorNumber)
                    }
                    aria-describedby={
                      errors.floorNumber ? "floorNumber-error" : undefined
                    }
                  />
                </div>
                {errors.floorNumber && touched.floorNumber && (
                  <p
                    id="floorNumber-error"
                    className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.floorNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  3. Area Dimensions
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Carpet and built-up area measurements in square feet
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="carpetArea"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Carpet Area <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="carpetArea"
                    name="carpetArea"
                    min="0"
                    step="1"
                    value={formData.carpetArea}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 1150"
                    className={`w-full pl-3.5 pr-16 py-2.5 rounded-xl border text-sm transition-colors outline-none bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${
                      errors.carpetArea && touched.carpetArea
                        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-500"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    }`}
                    aria-invalid={
                      Boolean(errors.carpetArea && touched.carpetArea)
                    }
                    aria-describedby={
                      errors.carpetArea ? "carpetArea-error" : undefined
                    }
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-200/60 dark:bg-zinc-700/60 px-2 py-0.5 rounded-md">
                    sq ft
                  </span>
                </div>
                {errors.carpetArea && touched.carpetArea && (
                  <p
                    id="carpetArea-error"
                    className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.carpetArea}
                  </p>
                )}
              </div>

              {/* Built-up Area */}
              <div className="space-y-1.5">
                <label
                  htmlFor="builtUpArea"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Built-up Area <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="builtUpArea"
                    name="builtUpArea"
                    min="0"
                    step="1"
                    value={formData.builtUpArea}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 1420"
                    className={`w-full pl-3.5 pr-16 py-2.5 rounded-xl border text-sm transition-colors outline-none bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${
                      errors.builtUpArea && touched.builtUpArea
                        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-500"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    }`}
                    aria-invalid={
                      Boolean(errors.builtUpArea && touched.builtUpArea)
                    }
                    aria-describedby={
                      errors.builtUpArea ? "builtUpArea-error" : undefined
                    }
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-200/60 dark:bg-zinc-700/60 px-2 py-0.5 rounded-md">
                    sq ft
                  </span>
                </div>
                {errors.builtUpArea && touched.builtUpArea && (
                  <p
                    id="builtUpArea-error"
                    className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.builtUpArea}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  4. Location Coordinates
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Geographical coordinates for property mapping
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="latitude"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                      <Compass className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      step="any"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 19.0760"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${
                        errors.latitude && touched.latitude
                          ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-500"
                          : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                      }`}
                      aria-invalid={
                        Boolean(errors.latitude && touched.latitude)
                      }
                      aria-describedby={
                        errors.latitude ? "latitude-error" : undefined
                      }
                    />
                  </div>
                  {errors.latitude && touched.latitude && (
                    <p
                      id="latitude-error"
                      className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.latitude}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="longitude"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                      <Compass className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      step="any"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 72.8777"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ${
                        errors.longitude && touched.longitude
                          ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-500"
                          : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                      }`}
                      aria-invalid={
                        Boolean(errors.longitude && touched.longitude)
                      }
                      aria-describedby={
                        errors.longitude ? "longitude-error" : undefined
                      }
                    />
                  </div>
                  {errors.longitude && touched.longitude && (
                    <p
                      id="longitude-error"
                      className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.longitude}
                    </p>
                  )}
                </div>
              </div>

              {/* Map Picker Placeholder Note */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>
                  Interactive map picker is coming soon. Please specify the
                  latitude and longitude manually.
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md shadow-blue-500/20 focus:outline-none focus:ring-4 focus:ring-blue-600/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Listing...</span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  <span>Create Listing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
