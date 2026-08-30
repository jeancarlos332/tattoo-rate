import type { TattooAnalysis, TattooSize, QuoteResult } from "../types/tattoo";

import {
  MIN_TATTOO_PRICE,
  getZoneBasePrice,
  getZoneName,
  hasCoverage,
  type TattooZone,
  type TattooSide,
  type TattooCoverage,
} from "../types/tattoo-pricing";

type BodyBuild = "slim" | "normal" | "thick";

interface CalculateQuoteParams {
  size: TattooSize;
  analysis: TattooAnalysis;

  zone: TattooZone;
  side: TattooSide;
  coverage: TattooCoverage;
  bodyBuild: BodyBuild;
}

/**
 * Limita un número entre mínimo y máximo.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Redondea a múltiplos de $10.000.
 */
function roundPrice(value: number): number {
  return Math.round(value / 10_000) * 10_000;
}

/**
 * Normaliza 1-10 a 0-1.
 */
function normalize10(value: number): number {
  return clamp((value - 1) / 9, 0, 1);
}

/**
 * Normaliza 1-5 a 0-1.
 */
function normalize5(value: number): number {
  return clamp((value - 1) / 4, 0, 1);
}

/**
 * Factor de cobertura.
 *
 * IMPORTANTE:
 * Este factor SOLO se utiliza
 * cuando la zona permite cobertura.
 */
function getCoverageFactor(coverage: TattooCoverage): number {
  switch (coverage) {
    case "small":
      return 0.35;

    case "medium":
      return 0.6;

    case "large":
      return 0.82;

    case "full":
      return 1;

    default:
      return 1;
  }
}

function getBodyBuildFactor(bodyBuild: BodyBuild): number {
  switch (bodyBuild) {
    case "slim":
      return 0.95;

    case "normal":
      return 1.0;

    case "thick":
      return 1.05;

    default:
      return 1.0;
  }
}

/**
 * Factor de estilo.
 *
 * El estilo aporta, pero no domina
 * el cálculo.
 */
function getStyleFactor(style: TattooAnalysis["style"]): number {
  switch (style) {
    case "minimalism":
      return 0.82;

    case "fine-line":
      return 0.88;

    case "lettering":
      return 0.9;

    case "geometric":
      return 1.0;

    case "ornamental":
      return 1.02;

    case "traditional":
      return 1.02;

    case "illustrative":
      return 1.05;

    case "japanese":
      return 1.08;

    case "black-and-grey":
      return 1.1;

    case "watercolor":
      return 1.08;

    case "abstract":
      return 1.0;

    case "realism":
      return 1.18;

    default:
      return 1.0;
  }
}

/**
 * Convierte el análisis de IA
 * en un factor de trabajo.
 */
function getDesignFactor(analysis: TattooAnalysis): {
  factor: number;
  complexityFactor: number;
  detailFactor: number;
  shadingFactor: number;
  inkFactor: number;
  colorFactor: number;
  lineFactor: number;
  styleFactor: number;
  elementFactor: number;
} {
  const complexity = normalize5(analysis.complexity);

  const detail = normalize10(analysis.detailLevel);

  const shading = normalize10(analysis.shadingLevel);

  const ink = normalize10(analysis.inkDensity);

  const line = normalize10(analysis.lineComplexity);

  /**
   * colorComplexity actualmente
   * viene de 0-10 desde la IA.
   */
  const color = clamp(analysis.colorComplexity / 10, 0, 1);

  const elements = clamp((analysis.elementCount - 1) / 9, 0, 1);

  const styleFactor = getStyleFactor(analysis.style);

  const factor =
    1 +
    complexity * 0.22 +
    detail * 0.15 +
    shading * 0.1 +
    ink * 0.08 +
    color * 0.08 +
    line * 0.08 +
    elements * 0.07;

  const combined = factor * styleFactor;

  return {
    factor: clamp(combined, 0.8, 1.65),

    complexityFactor: 1 + complexity * 0.22,

    detailFactor: 1 + detail * 0.15,

    shadingFactor: 1 + shading * 0.1,

    inkFactor: 1 + ink * 0.08,

    colorFactor: 1 + color * 0.08,

    lineFactor: 1 + line * 0.08,

    styleFactor,

    elementFactor: 1 + elements * 0.07,
  };
}

/**
 * Estima sesiones.
 *
 * Las sesiones NO calculan el precio.
 * Solamente sirven como referencia.
 */
function estimateSessions(price: number): number {
  if (price <= 700_000) {
    return 1;
  }

  if (price <= 1_200_000) {
    return 2;
  }

  if (price <= 2_000_000) {
    return 3;
  }

  if (price <= 3_000_000) {
    return 4;
  }

  if (price <= 4_000_000) {
    return 5;
  }

  return 6;
}

/**
 * Calcula la cotización completa.
 */
export function calculateQuote({
  size,
  analysis,
  zone,
  side,
  coverage,
  bodyBuild,
}: CalculateQuoteParams): QuoteResult {
  /**
   * Área física.
   *
   * Para zonas normales no domina
   * el precio.
   *
   * Para "custom" sí puede ayudar
   * a construir una referencia.
   */
  const area = Math.max(1, size.width * size.height);

  /**
   * Posición de complejidad:
   *
   * 55% complejidad
   * 25% detalle
   * 20% sombreado
   */
  const complexityPosition = clamp(
    normalize5(analysis.complexity) * 0.55 +
      normalize10(analysis.detailLevel) * 0.25 +
      normalize10(analysis.shadingLevel) * 0.2,
    0,
    1,
  );

  /**
   * Precio base de la zona.
   */
  let zoneBase = getZoneBasePrice(zone, complexityPosition);

  /**
   * Diseño artístico detectado por IA.
   */
  const design = getDesignFactor(analysis);

  /**
   * =====================================================
   * COBERTURA
   * =====================================================
   *
   * SOLO aplicamos cobertura en:
   *
   * - pecho
   * - espalda superior
   * - otra zona
   *
   * Las zonas completas NO pasan por aquí.
   */
  let coverageFactor = 1;

  if (hasCoverage(zone)) {
    coverageFactor = getCoverageFactor(coverage);
  }

  /**
   * Para "custom", el tamaño sí participa
   * de la construcción del precio.
   *
   * No queremos que un custom pequeño
   * llegue automáticamente a $1M.
   */
  if (zone === "custom") {
    const normalizedArea = clamp(area / 500, 0.1, 1);

    zoneBase = 120_000 + (1_000_000 - 120_000) * normalizedArea;
  }

  /**
   * Precio inicial.
   */
  let price = zoneBase * coverageFactor;

  /**
   * =====================================================
   * AJUSTE DE TAMAÑO PARA CUSTOM
   * =====================================================
   */
  if (zone === "custom") {
    if (area <= 49) {
      price *= 0.8;
    } else if (area <= 100) {
      price *= 0.9;
    }
  }

  /**
   * =====================================================
   * IA
   * =====================================================
   *
   * Aquí es donde realmente entra
   * la complejidad artística.
   */
  price *= design.factor;

  const bodyBuildFactor = getBodyBuildFactor(bodyBuild);

  price *= bodyBuildFactor;

  /**
   * =====================================================
   * LADO
   * =====================================================
   *
   * Solo hacemos una pequeña diferencia
   * para zonas donde existe exterior/interior.
   *
   * Las zonas completas no deberían
   * siquiera enviar un lado relevante,
   * pero dejamos la protección aquí.
   */
  if (side === "inner" && zone !== "custom") {
    price *= 0.97;
  }

  /**
   * Precio mínimo absoluto.
   */
  price = Math.max(MIN_TATTOO_PRICE, price);

  /**
   * Redondeo comercial.
   */
  const suggestedPrice = roundPrice(price);

  /**
   * Rango estimado.
   */
  const minPrice = Math.max(MIN_TATTOO_PRICE, roundPrice(suggestedPrice * 0.9));

  const maxPrice = roundPrice(suggestedPrice * 1.1);

  /**
   * Sesiones informativas.
   */
  const sessions = estimateSessions(suggestedPrice);

  return {
    minPrice,
    maxPrice,
    suggestedPrice,

    sessions,

    zone: getZoneName(zone),

    coverage: hasCoverage(zone) ? coverage : "full",

    factors: {
      zoneFactor: zoneBase,

      coverageFactor,

      complexityFactor: design.complexityFactor,

      detailFactor: design.detailFactor,

      shadingFactor: design.shadingFactor,

      inkFactor: design.inkFactor,

      colorFactor: design.colorFactor,

      lineFactor: design.lineFactor,

      styleFactor: design.styleFactor,

      elementFactor: design.elementFactor,
    },
  };
}
