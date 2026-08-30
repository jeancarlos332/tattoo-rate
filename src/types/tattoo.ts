export interface TattooAnalysis {
  style:
    | "realism"
    | "black-and-grey"
    | "fine-line"
    | "minimalism"
    | "geometric"
    | "traditional"
    | "illustrative"
    | "lettering"
    | "ornamental"
    | "japanese"
    | "watercolor"
    | "abstract"
    | "unknown";

  complexity: number;
  detailLevel: number;
  shadingLevel: number;
  inkDensity: number;
  colorComplexity: number;
  lineComplexity: number;
  elementCount: number;
}

export interface TattooSize {
  width: number;
  height: number;
}

export interface QuoteResult {
  minPrice: number;
  maxPrice: number;
  suggestedPrice: number;

  sessions: number;

  zone: string;
  coverage: string;

  factors: {
    zoneFactor: number;
    coverageFactor: number;
    complexityFactor: number;
    detailFactor: number;
    shadingFactor: number;
    inkFactor: number;
    colorFactor: number;
    lineFactor: number;
    styleFactor: number;
    elementFactor: number;
  };
}