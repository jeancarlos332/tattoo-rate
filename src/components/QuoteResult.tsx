import {
  Check,
  CalendarDays,
  MapPin,
} from "lucide-react";

import type {
  QuoteResult,
  TattooAnalysis,
} from "../types/tattoo";

interface QuoteResultProps {
  quote: QuoteResult;
  analysis: TattooAnalysis;
}

export function QuoteResult({
  quote,
  analysis,
}: QuoteResultProps) {
  const formattedSuggestedPrice =
    formatCurrency(
      quote.suggestedPrice,
    );

  const formattedMinPrice =
    formatCurrency(
      quote.minPrice,
    );

  const formattedMaxPrice =
    formatCurrency(
      quote.maxPrice,
    );

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">

      {/* PRECIO PRINCIPAL */}
      <div className="p-6 text-center">

        <p className="text-sm font-medium text-zinc-500">
          Precio estimado
        </p>

        <div className="mt-2 text-4xl font-bold tracking-tight text-white">
          {formattedSuggestedPrice}
        </div>

        <p className="mt-2 text-xs text-zinc-600">
          Rango estimado:{" "}
          {formattedMinPrice} -{" "}
          {formattedMaxPrice}
        </p>

        {/* SESIONES */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-300">
          <CalendarDays className="h-4 w-4" />

          {quote.sessions === 1
            ? "1 sesión"
            : `${quote.sessions} sesiones`}
        </div>

        <p className="mt-2 text-xs text-zinc-600">
          Las sesiones son una referencia y
          no determinan el precio.
        </p>
      </div>

      {/* INFORMACIÓN DE LA ZONA */}
      <div className="border-t border-zinc-800 px-6 py-5">

        <div className="mb-4 flex items-center gap-2">

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
            <Check className="h-4 w-4 text-white" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Análisis del diseño
            </p>

            <p className="text-xs text-zinc-500">
              Detectado automáticamente por IA
            </p>
          </div>

        </div>

        {/* ZONA */}
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-zinc-950 px-4 py-3">

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-zinc-500" />

            <span className="text-sm text-zinc-500">
              Zona
            </span>
          </div>

          <span className="text-sm font-semibold text-white">
            {quote.zone}
          </span>

        </div>

        {/* ANÁLISIS IA */}
        <div className="grid grid-cols-2 gap-3">

          <Info
            label="Estilo"
            value={formatStyle(
              analysis.style,
            )}
          />

          <Info
            label="Complejidad"
            value={`${analysis.complexity}/5`}
          />

          <Info
            label="Detalle"
            value={`${analysis.detailLevel}/10`}
          />

          <Info
            label="Sombreado"
            value={`${analysis.shadingLevel}/10`}
          />

          <Info
            label="Densidad de tinta"
            value={`${analysis.inkDensity}/10`}
          />

          <Info
            label="Color"
            value={
              analysis.colorComplexity > 0
                ? `${analysis.colorComplexity}/10`
                : "Sin color"
            }
          />

          <Info
            label="Complejidad de línea"
            value={`${analysis.lineComplexity}/10`}
          />

          <Info
            label="Elementos"
            value={`${analysis.elementCount}`}
          />

        </div>

        {/* FACTORES */}
        <div className="mt-4 rounded-2xl bg-zinc-950 p-4">

          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-600">
            Factores considerados
          </p>

          <div className="space-y-2">

            <FactorRow
              label="Zona"
              value={formatFactor(
                quote.factors.zoneFactor,
              )}
            />

            <FactorRow
              label="Complejidad"
              value={formatFactor(
                quote.factors.complexityFactor,
              )}
            />

            <FactorRow
              label="Detalle"
              value={formatFactor(
                quote.factors.detailFactor,
              )}
            />

            <FactorRow
              label="Sombreado"
              value={formatFactor(
                quote.factors.shadingFactor,
              )}
            />

            <FactorRow
              label="Densidad de tinta"
              value={formatFactor(
                quote.factors.inkFactor,
              )}
            />

            <FactorRow
              label="Color"
              value={formatFactor(
                quote.factors.colorFactor,
              )}
            />

            <FactorRow
              label="Líneas"
              value={formatFactor(
                quote.factors.lineFactor,
              )}
            />

            <FactorRow
              label="Estilo"
              value={formatFactor(
                quote.factors.styleFactor,
              )}
            />

            <FactorRow
              label="Elementos"
              value={formatFactor(
                quote.factors.elementFactor,
              )}
            />

          </div>
        </div>

        {/* NOTA */}
        <p className="mt-4 text-center text-xs leading-5 text-zinc-600">
          El precio es una estimación basada
          en la zona seleccionada y en las
          características detectadas en el
          diseño. La cotización final puede
          variar después de la revisión del
          artista.
        </p>

      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "es-CO",
    {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function formatFactor(
  value: number,
): string {
  return `${value.toFixed(2)}x`;
}

function formatStyle(
  style: TattooAnalysis["style"],
): string {
  const styles: Record<
    TattooAnalysis["style"],
    string
  > = {
    realism: "Realismo",
    "black-and-grey": "Black & Grey",
    "fine-line": "Fine line",
    minimalism: "Minimalista",
    geometric: "Geométrico",
    traditional: "Tradicional",
    illustrative: "Ilustrativo",
    lettering: "Lettering",
    ornamental: "Ornamental",
    japanese: "Japonés",
    watercolor: "Watercolor",
    abstract: "Abstracto",
    unknown: "No determinado",
  };

  return styles[style];
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-950 p-3">

      <p className="text-xs text-zinc-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium capitalize text-zinc-200">
        {value}
      </p>

    </div>
  );
}

function FactorRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">

      <span className="text-sm text-zinc-600">
        {label}
      </span>

      <span className="text-sm font-medium text-zinc-300">
        {value}
      </span>

    </div>
  );
}