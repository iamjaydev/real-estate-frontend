"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";

interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface ImageUploadProps {
  onImagesChange?: (files: File[]) => void;
  multiple?: boolean;
}

export default function ImageUpload({ onImagesChange, multiple = true }: ImageUploadProps) {
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles: UploadedFile[] = [];

    Array.from(fileList).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
    });

    if (newFiles.length === 0) return;

    setImages((prev) => {
      const updated = multiple ? [...prev, ...newFiles] : newFiles;
      onImagesChange?.(updated.map((item) => item.file));
      return updated;
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      const updated = prev.filter((img) => img.id !== id);
      onImagesChange?.(updated.map((item) => item.file));
      return updated;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
            : "border-zinc-300 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100/80 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
        />
        <svg
          className="w-10 h-10 mb-3 text-zinc-400 dark:text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          PNG, JPG, GIF, WEBP, SVG
        </p>
      </div>

      {/* Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 aspect-square"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.previewUrl}
                alt={image.file.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(image.id);
                  }}
                  className="self-end p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                  aria-label="Remove image"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="text-[10px] text-white truncate drop-shadow">
                  <p className="font-medium truncate">{image.file.name}</p>
                  <p className="opacity-80">{formatFileSize(image.file.size)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
