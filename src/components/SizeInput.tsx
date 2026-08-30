import type { TattooSize } from "../types/tattoo";

interface SizeInputProps {
  value: TattooSize;
  onChange: (value: TattooSize) => void;
}

export function SizeInput({
  value,
  onChange,
}: SizeInputProps) {
  function updateWidth(width: string) {
    onChange({
      ...value,
      width: Number(width),
    });
  }

  function updateHeight(height: string) {
    onChange({
      ...value,
      height: Number(height),
    });
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">
          Tamaño del tatuaje
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Indica aproximadamente cuánto quieres que mida.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="mb-2 block text-xs font-medium text-zinc-500">
            Ancho
          </label>

          <div className="relative">
            <input
              type="number"
              min="1"
              step="0.5"
              value={value.width || ""}
              onChange={(event) =>
                updateWidth(event.target.value)
              }
              placeholder="15"
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-12 text-white placeholder:text-zinc-700"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-600">
              cm
            </span>
          </div>
        </div>

        <span className="mt-6 text-zinc-600">×</span>

        <div className="flex-1">
          <label className="mb-2 block text-xs font-medium text-zinc-500">
            Alto
          </label>

          <div className="relative">
            <input
              type="number"
              min="1"
              step="0.5"
              value={value.height || ""}
              onChange={(event) =>
                updateHeight(event.target.value)
              }
              placeholder="20"
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 pr-12 text-white placeholder:text-zinc-700"
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-600">
              cm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}