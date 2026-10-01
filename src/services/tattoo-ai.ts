import type { TattooAnalysis } from "../types/tattoo";

const API_URL = import.meta.env.API_URL;

export type AIStatus =
  | "loading-processor"
  | "loading-model"
  | "model-ready"
  | "loading-image"
  | "analyzing"
  | "completed"
  | "error";

export async function analyzeTattoo(
  file: File,
  onStatus?: (status: AIStatus) => void,
): Promise<TattooAnalysis> {
  try {
    onStatus?.("loading-image");

    const formData = new FormData();

    formData.append("file", file);

    onStatus?.("analyzing");

    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Error del servidor (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    console.log("Respuesta del backend:", data);

    const result = parseAnalysis(data);

    onStatus?.("completed");

    return result;
  } catch (error) {
    onStatus?.("error");

    console.error("Error analizando tatuaje:", error);

    throw error;
  }
}

type TattooStyle =
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

function parseAnalysis(data: unknown): TattooAnalysis {
  if (!data || typeof data !== "object") {
    throw new Error("El backend no devolvió un objeto válido.");
  }

  const parsed = data as Record<string, unknown>;

  const style = typeof parsed.style === "string" ? parsed.style : "unknown";

  const allowedStyles: TattooStyle[] = [
    "realism",
    "black-and-grey",
    "fine-line",
    "minimalism",
    "geometric",
    "traditional",
    "illustrative",
    "lettering",
    "ornamental",
    "japanese",
    "watercolor",
    "abstract",
    "unknown",
  ];

  const normalizedStyle: TattooStyle = allowedStyles.includes(
    style as TattooStyle,
  )
    ? (style as TattooStyle)
    : "unknown";

  return {
    style: normalizedStyle,

    complexity: clamp(Number(parsed.complexity), 1, 5),

    detailLevel: clamp(Number(parsed.detailLevel), 1, 10),

    shadingLevel: clamp(Number(parsed.shadingLevel), 1, 10),

    inkDensity: clamp(Number(parsed.inkDensity), 1, 10),

    colorComplexity: clamp(Number(parsed.colorComplexity), 0, 3),

    lineComplexity: clamp(Number(parsed.lineComplexity), 1, 10),

    elementCount: clamp(Number(parsed.elementCount), 1, 50),
  };
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.max(min, Math.min(max, Math.round(value)));
}
