export type TattooSide =
  | "outer"
  | "inner";

export type TattooCoverage =
  | "small"
  | "medium"
  | "large"
  | "full";

export type TattooZone =
  | "wrist_to_elbow"
  | "elbow_to_shoulder"
  | "wrist_to_shoulder"
  | "arm_full"
  | "hip_to_knee"
  | "knee_to_ankle"
  | "ankle_to_hip"
  | "leg_full"
  | "back_upper"
  | "back_full"
  | "chest"
  | "thigh"
  | "calf"
  | "forearm"
  | "upper_arm"
  | "custom";

export interface ZonePriceReference {
  name: string;
  min: number;
  max: number;
}

/**
 * Precios de referencia para cubrir
 * completamente la zona seleccionada.
 *
 * IMPORTANTE:
 * Estos NO son precios finales.
 *
 * La IA modifica el precio según:
 *
 * - complejidad
 * - detalle
 * - sombreado
 * - tinta
 * - color
 * - líneas
 * - estilo
 * - cantidad de elementos
 */
export const TATTOO_ZONE_PRICES: Record<
  TattooZone,
  ZonePriceReference
> = {
  wrist_to_elbow: {
    name: "Muñeca a codo",
    min: 800_000,
    max: 800_000,
  },

  elbow_to_shoulder: {
    name: "Codo a hombro",
    min: 1_000_000,
    max: 1_200_000,
  },

  wrist_to_shoulder: {
    name: "Muñeca a hombro",
    min: 1_800_000,
    max: 2_000_000,
  },

  arm_full: {
    name: "Brazo completo",
    min: 1_800_000,
    max: 2_000_000,
  },

  hip_to_knee: {
    name: "Cadera a rodilla",
    min: 1_600_000,
    max: 1_600_000,
  },

  knee_to_ankle: {
    name: "Rodilla a tobillo",
    min: 1_200_000,
    max: 1_200_000,
  },

  ankle_to_hip: {
    name: "Tobillo a cadera",
    min: 2_800_000,
    max: 2_800_000,
  },

  leg_full: {
    name: "Pierna completa",
    min: 2_800_000,
    max: 3_200_000,
  },

  back_upper: {
    name: "Parte superior de la espalda",
    min: 1_500_000,
    max: 2_500_000,
  },

  back_full: {
    name: "Espalda completa",
    min: 4_000_000,
    max: 5_000_000,
  },

  chest: {
    name: "Pecho",
    min: 1_500_000,
    max: 2_500_000,
  },

  thigh: {
    name: "Muslo",
    min: 1_200_000,
    max: 2_000_000,
  },

  calf: {
    name: "Pantorrilla",
    min: 800_000,
    max: 1_400_000,
  },

  forearm: {
    name: "Antebrazo",
    min: 600_000,
    max: 1_000_000,
  },

  upper_arm: {
    name: "Brazo superior",
    min: 700_000,
    max: 1_200_000,
  },

  custom: {
    name: "Otra zona",
    min: 120_000,
    max: 1_000_000,
  },
};

/**
 * Precio mínimo absoluto.
 */
export const MIN_TATTOO_PRICE = 120_000;

/**
 * Zonas que representan una referencia
 * completa y NO necesitan centímetros.
 *
 * Tampoco necesitan cobertura porque
 * el precio ya representa la zona completa.
 */
export const FULL_REFERENCE_ZONES: TattooZone[] = [
  "wrist_to_elbow",
  "elbow_to_shoulder",
  "wrist_to_shoulder",
  "arm_full",

  "hip_to_knee",
  "knee_to_ankle",
  "ankle_to_hip",
  "leg_full",

  "back_full",

  "thigh",
  "calf",
  "forearm",
  "upper_arm",
];

/**
 * Zonas donde el usuario puede indicar
 * qué porcentaje de la zona quiere tatuar.
 *
 * Ejemplo:
 *
 * Pecho completo
 * Medio pectoral
 * Una parte de la espalda superior
 */
export const COVERAGE_ZONES: TattooZone[] = [
  "chest",
  "back_upper",
  "custom",
];

/**
 * Zonas donde tiene sentido elegir
 * exterior o interior.
 */
export const SIDE_ZONES: TattooZone[] = [
  "wrist_to_elbow",
  "elbow_to_shoulder",

  "hip_to_knee",
  "knee_to_ankle",
  "ankle_to_hip",

  "thigh",
  "calf",
];

/**
 * Determina si una zona utiliza una
 * referencia completa.
 */
export function isFullReferenceZone(
  zone: TattooZone,
): boolean {
  return FULL_REFERENCE_ZONES.includes(zone);
}

/**
 * Determina si una zona permite
 * seleccionar cobertura.
 */
export function hasCoverage(
  zone: TattooZone,
): boolean {
  return COVERAGE_ZONES.includes(zone);
}

/**
 * Determina si una zona permite
 * seleccionar exterior/interior.
 */
export function hasSide(
  zone: TattooZone,
): boolean {
  return SIDE_ZONES.includes(zone);
}

/**
 * Determina si una zona necesita
 * centímetros.
 *
 * Actualmente solamente "custom".
 */
export function requiresSize(
  zone: TattooZone,
): boolean {
  return zone === "custom";
}

/**
 * Nombre amigable de la zona.
 */
export function getZoneName(
  zone: TattooZone,
): string {
  return TATTOO_ZONE_PRICES[zone].name;
}

/**
 * Calcula un precio base interpolado
 * dentro del rango definido para la zona.
 *
 * complexityPosition:
 *
 * 0 = mínimo
 * 1 = máximo
 */
export function getZoneBasePrice(
  zone: TattooZone,
  complexityPosition: number,
): number {
  const reference =
    TATTOO_ZONE_PRICES[zone];

  const position = Math.max(
    0,
    Math.min(
      1,
      complexityPosition,
    ),
  );

  return (
    reference.min +
    (reference.max -
      reference.min) *
      position
  );
}