import ImageUpload from "@/components/ImageUpload";

export default function ImageUploadPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 flex flex-col items-center justify-start bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-2xl mb-8 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight">Image Upload</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Upload images with drag and drop preview.
        </p>
      </div>

      <ImageUpload />
    </main>
  );
}
