import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
}

export function ImageUploader({
  onImageChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleFile(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const url = URL.createObjectURL(file);

    setPreview(url);
    onImageChange(file);
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    handleFile(event.target.files?.[0]);
  }

  function removeImage() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    onImageChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-72 w-full flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/60 px-6 text-center transition active:scale-[0.99]"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
            <ImagePlus className="h-8 w-8 text-zinc-300" />
          </div>

          <h2 className="text-lg font-semibold text-white">
            Sube tu referencia
          </h2>

          <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
            La imagen será analizada para estimar la
            complejidad del tatuaje.
          </p>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
          <img
            src={preview}
            alt="Referencia del tatuaje"
            className="max-h-[420px] w-full object-contain"
          />

          <button
            type="button"
            onClick={removeImage}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm"
            aria-label="Eliminar imagen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}