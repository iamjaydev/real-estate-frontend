"use client";

import { useState, FormEvent, ChangeEvent, FocusEvent } from "react";
import { Loader2 } from "lucide-react";

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

type FormErrors = Partial<Record<keyof CreateListingFormData, string>>;
type FormTouched = Partial<Record<keyof CreateListingFormData, boolean>>;

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

function validateField(
  name: keyof CreateListingFormData,
  value: string,
  data: CreateListingFormData,
): string | undefined {
  switch (name) {
    case "title":
      if (!value.trim()) return "Property title is required";
      if (value.trim().length < 5) return "Title must be at least 5 characters";
      return;

    case "description":
      if (!value.trim()) return "Description is required";
      if (value.trim().length < 20)
        return "Description must be at least 20 characters";
      return;

    case "propertyType":
      if (!value) return "Please select a property type";
      return;

    case "price": {
      const n = Number(value);
      if (!value || isNaN(n) || n <= 0)
        return "Please enter a valid positive price";
      return;
    }

    case "bedrooms": {
      const n = Number(value);
      if (!value || isNaN(n) || n < 0 || !Number.isInteger(n))
        return "Please enter a valid number of bedrooms";
      return;
    }

    case "bathrooms": {
      const n = Number(value);
      if (!value || isNaN(n) || n < 0 || !Number.isInteger(n))
        return "Please enter a valid number of bathrooms";
      return;
    }

    case "floorNumber": {
      if (!value && value !== "0") return "Floor number is required";
      const n = Number(value);
      if (isNaN(n) || !Number.isInteger(n))
        return "Please enter a valid floor number";
      return;
    }

    case "carpetArea": {
      const n = Number(value);
      if (!value || isNaN(n) || n <= 0)
        return "Please enter a valid carpet area";
      return;
    }

    case "builtUpArea": {
      const n = Number(value);
      if (!value || isNaN(n) || n <= 0)
        return "Please enter a valid built-up area";
      if (data.carpetArea && n < Number(data.carpetArea))
        return "Built-up area cannot be less than carpet area";
      return;
    }

    case "latitude": {
      const n = Number(value);
      if (!value || isNaN(n) || n < -90 || n > 90)
        return "Latitude must be between -90 and 90";
      return;
    }

    case "longitude": {
      const n = Number(value);
      if (!value || isNaN(n) || n < -180 || n > 180)
        return "Longitude must be between -180 and 180";
      return;
    }
  }
}

function validateForm(data: CreateListingFormData): FormErrors {
  const errors: FormErrors = {};
  (Object.keys(data) as Array<keyof CreateListingFormData>).forEach((field) => {
    const err = validateField(field, data[field], data);
    if (err) errors[field] = err;
  });
  return errors;
}

const formatPrice = (val: string) => {
  const num = Number(val);
  if (isNaN(num)) return val;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const inputClass = (hasError: boolean) =>
  `w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-colors bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 ${
    hasError
      ? "border-red-500 focus:ring-4 focus:ring-red-500/10"
      : "border-zinc-300 dark:border-zinc-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
  }`;

type FieldProps = {
  label: string;
  name: keyof CreateListingFormData;
  error?: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
};

function Field({ label, name, error, children, hint, className }: FieldProps) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label} <span className="text-red-500">*</span>
      </label>
      {children}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export default function BrokerCreateListingPage() {
  const [formData, setFormData] =
    useState<CreateListingFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const field = name as keyof CreateListingFormData;
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value, updated),
      }));
    }
    if (field === "carpetArea" && touched.builtUpArea) {
      setErrors((prev) => ({
        ...prev,
        builtUpArea: validateField(
          "builtUpArea",
          formData.builtUpArea,
          updated,
        ),
      }));
    }
  };

  const handleBlur = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const field = name as keyof CreateListingFormData;
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, value, formData),
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Partial<Record<keyof CreateListingFormData, boolean>> =
      {};
    (Object.keys(formData) as Array<keyof CreateListingFormData>).forEach(
      (key) => {
        allTouched[key] = true;
      },
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
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Create New Listing</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Fill in the property details to publish a new listing.
          </p>
        </div>

        {isSuccess && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
            Listing created successfully.
          </div>
        )}

        {submitError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          <div className="space-y-4">
            <Field
              label="Property Title"
              name="title"
              error={touched.title ? errors.title : undefined}
            >
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Elegant 3 BHK Apartment with Skyline View"
                className={inputClass(!!(touched.title && errors.title))}
              />
            </Field>

            <Field
              label="Description"
              name="description"
              error={touched.description ? errors.description : undefined}
            >
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Describe key highlights, features, and neighborhood advantages..."
                className={`${inputClass(!!(touched.description && errors.description))} resize-y`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Property Type"
              name="propertyType"
              error={touched.propertyType ? errors.propertyType : undefined}
            >
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass(
                  !!(touched.propertyType && errors.propertyType),
                )}
              >
                <option value="" disabled>
                  Select property type
                </option>
                <option value="Flat">Flat</option>
                <option value="House / Land">House / Land</option>
              </select>
            </Field>

            <Field
              label="Price (INR)"
              name="price"
              error={touched.price ? errors.price : undefined}
              hint={
                formData.price && !errors.price
                  ? formatPrice(formData.price)
                  : undefined
              }
            >
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
                className={inputClass(!!(touched.price && errors.price))}
              />
            </Field>

            <Field
              label="Bedrooms"
              name="bedrooms"
              error={touched.bedrooms ? errors.bedrooms : undefined}
            >
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
                className={inputClass(!!(touched.bedrooms && errors.bedrooms))}
              />
            </Field>

            <Field
              label="Bathrooms"
              name="bathrooms"
              error={touched.bathrooms ? errors.bathrooms : undefined}
            >
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
                className={inputClass(
                  !!(touched.bathrooms && errors.bathrooms),
                )}
              />
            </Field>

            <Field
              label="Floor Number"
              name="floorNumber"
              error={touched.floorNumber ? errors.floorNumber : undefined}
            >
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
                className={inputClass(
                  !!(touched.floorNumber && errors.floorNumber),
                )}
              />
            </Field>

            <Field
              label="Carpet Area (sq ft)"
              name="carpetArea"
              error={touched.carpetArea ? errors.carpetArea : undefined}
            >
              <input
                type="number"
                id="carpetArea"
                name="carpetArea"
                min="0"
                value={formData.carpetArea}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 1150"
                className={inputClass(
                  !!(touched.carpetArea && errors.carpetArea),
                )}
              />
            </Field>

            <Field
              label="Built-up Area (sq ft)"
              name="builtUpArea"
              error={touched.builtUpArea ? errors.builtUpArea : undefined}
            >
              <input
                type="number"
                id="builtUpArea"
                name="builtUpArea"
                min="0"
                value={formData.builtUpArea}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 1420"
                className={inputClass(
                  !!(touched.builtUpArea && errors.builtUpArea),
                )}
              />
            </Field>

            <Field
              label="Latitude"
              name="latitude"
              error={touched.latitude ? errors.latitude : undefined}
            >
              <input
                type="number"
                step="any"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 19.0760"
                className={inputClass(!!(touched.latitude && errors.latitude))}
              />
            </Field>

            <Field
              label="Longitude"
              name="longitude"
              error={touched.longitude ? errors.longitude : undefined}
            >
              <input
                type="number"
                step="any"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 72.8777"
                className={inputClass(
                  !!(touched.longitude && errors.longitude),
                )}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Creating..." : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
