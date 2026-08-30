import {
  AutoProcessor,
  Qwen3VLForConditionalGeneration,
  RawImage,
} from "@huggingface/transformers";

import type { TattooAnalysis } from "../types/tattoo";

const MODEL_ID =
  "huggingworld/Qwen3-VL-2B-Instruct-ONNX";

let processor: any = null;
let model: any = null;
let loadingPromise: Promise<void> | null = null;

async function loadModel(): Promise<void> {
  if (processor && model) {
    return;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    console.log("Cargando procesador Qwen3-VL...");

    processor =
      await AutoProcessor.from_pretrained(
        MODEL_ID,
      );

    console.log("Procesador cargado.");

    console.log(
      "Cargando Qwen3-VL-2B en WebGPU...",
    );

    model =
      await Qwen3VLForConditionalGeneration.from_pretrained(
        MODEL_ID,
        {
          device: "webgpu",
          dtype: {
            embed_tokens: "fp16",
            vision_encoder: "fp16",
            decoder_model_merged: "q4f16",
          },
        },
      );

    console.log("Modelo Qwen3-VL cargado.");
  })();

  try {
    await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

const PROMPT = `
You are a professional tattoo artist and tattoo production specialist.

Your job is to analyze the tattoo design shown in the image and estimate the actual visual and technical workload required for a professional tattoo artist to reproduce it.

IMPORTANT:
Analyze ONLY the tattoo artwork.

IGNORE:
- skin
- body parts
- hands
- fingers
- clothing
- background
- photography
- camera perspective
- lighting
- reflections
- shadows caused by photography
- image quality
- image resolution

Do NOT estimate tattoo size.
Do NOT estimate body placement.
Do NOT estimate price.
Do NOT estimate hours.
Do NOT describe the tattoo in natural language.

You must classify the visual characteristics of the tattoo itself.

==================================================
STYLE
==================================================

Choose EXACTLY ONE style from this list:

realism
black-and-grey
fine-line
minimalism
geometric
traditional
illustrative
lettering
ornamental
japanese
watercolor
abstract
unknown

STYLE RULES:

realism:
Use this when the design attempts to reproduce real objects, people, animals, faces, statues, portraits, realistic flowers, realistic anatomy, realistic textures, or photographic appearance.

black-and-grey:
Use this when the tattoo primarily uses black ink and grey shading, especially with gradients, smooth tonal transitions, realistic shading, or solid black and grey rendering.

fine-line:
Use this when the design is primarily made from thin, delicate, precise lines with little visual mass and little or no heavy shading.

minimalism:
Use this ONLY when the design is intentionally extremely simple, uses very few visual components, has very little detail, very little ink coverage, and very simple construction.

IMPORTANT DIFFERENCE:

A tattoo can use thin lines and still be complex.

Do NOT classify a tattoo as minimalism just because it uses thin lines.

If the tattoo contains several visual components, internal details, decorative elements, complex shapes, or significant linework, prefer fine-line or illustrative instead of minimalism.

geometric:
Use this when geometric shapes, symmetry, mathematical forms, patterns, or precise geometric construction dominate the design.

traditional:
Use this when the tattoo clearly follows classic traditional tattoo aesthetics with bold outlines, simplified shapes, strong solid fills, and traditional visual motifs.

illustrative:
Use this when the tattoo looks like an illustrated drawing and does not strongly belong to another specific style.

lettering:
Use this when text, typography, words, names, numbers, or lettering are the dominant visual element.

ornamental:
Use this when decorative patterns, mandalas, filigree, symmetrical ornaments, ornamental geometry, or decorative structures dominate.

japanese:
Use this when Japanese tattoo aesthetics clearly dominate, including traditional Japanese composition, Japanese motifs, waves, dragons, koi, masks, flowers, clouds, wind bars, or similar elements.

watercolor:
Use this when the design clearly imitates watercolor painting with colored washes, paint-like transitions, splashes, or watercolor effects.

abstract:
Use this when the design does not represent recognizable objects and primarily uses abstract shapes or concepts.

unknown:
Use this only when the style cannot reasonably be determined.

==================================================
COMPLEXITY
==================================================

Return an integer from 1 to 5.

This measures the OVERALL WORKLOAD of reproducing the tattoo.

Do NOT automatically choose 3.

Use the following strict scale:

1 = extremely simple
2 = simple
3 = moderate
4 = complex
5 = extremely complex

COMPLEXITY 1:

Use 1 ONLY when the tattoo is extremely simple.

Typical characteristics:
- one very simple visual concept
- very few lines
- almost no internal detail
- almost no shading
- almost no filled areas
- very low technical precision
- minimal visual structure

Examples:
- simple heart outline
- tiny simple symbol
- simple star
- single basic flower outline
- simple minimalist icon

COMPLEXITY 2:

Use 2 when the tattoo is simple but requires more work than a basic symbol.

Typical characteristics:
- one or two simple elements
- limited internal detail
- simple linework
- little shading
- limited ink coverage
- low technical difficulty

COMPLEXITY 3:

Use 3 only when the tattoo has a genuinely moderate workload.

Typical characteristics:
- multiple visual elements
- moderate linework
- moderate detail
- moderate composition
- some shading or filled areas
- moderate technical precision

COMPLEXITY 4:

Use 4 when the tattoo requires clearly significant artistic and technical work.

Typical characteristics:
- several interacting elements
- substantial detail
- complex linework
- meaningful shading
- difficult textures
- significant black coverage
- complex composition
- high precision requirements

COMPLEXITY 5:

Use 5 only for extremely demanding designs.

Typical characteristics:
- many interacting elements
- extremely detailed textures
- complex realistic rendering
- difficult anatomy
- extensive shading
- very dense ink coverage
- highly precise linework
- highly complex composition
- very high technical difficulty

CRITICAL RULE:

Do not default to complexity 3.

First evaluate the evidence in the image.

A very simple minimalist tattoo should normally receive complexity 1 or 2.

A moderately detailed tattoo should normally receive complexity 3.

A highly detailed realistic tattoo should normally receive complexity 4 or 5.

==================================================
DETAIL LEVEL
==================================================

Return an integer from 1 to 10.

This measures the amount of visible visual information inside the tattoo.

1 = almost no detail
2 = very little detail
3 = low detail
4 = moderate-low detail
5 = moderate detail
6 = moderately high detail
7 = high detail
8 = very high detail
9 = extremely high detail
10 = exceptional detail

Consider:
- internal shapes
- textures
- small features
- micro-details
- surface details
- anatomical details
- decorative details
- small visual structures

IMPORTANT:

Do not confuse number of elements with detail.

A tattoo can have several elements but still have low detail.

A single realistic face can have very high detail.

==================================================
SHADING LEVEL
==================================================

Return an integer from 1 to 10.

This measures the actual amount and technical difficulty of shading.

1 = no shading or almost no shading
2 = extremely light/simple shading
3 = limited shading
4 = moderate shading
5 = moderate amount of shading
6 = significant shading
7 = extensive shading
8 = very extensive shading
9 = highly complex shading
10 = extremely complex professional shading

Look specifically for:
- gradients
- tonal transitions
- grey washes
- smooth shadows
- realistic volume
- cross shading
- layered shading
- complex light and shadow

IMPORTANT:

If the tattoo is only outlines, use 1.

Do not give a high shading score just because the image contains photographic shadows.

Ignore shadows caused by photography.

==================================================
INK DENSITY
==================================================

Return an integer from 1 to 10.

This measures how much of the tattoo design is occupied by ink.

1 = almost no ink
2 = very low ink coverage
3 = low ink coverage
4 = moderate-low coverage
5 = moderate coverage
6 = moderately high coverage
7 = high coverage
8 = very high coverage
9 = extremely dense coverage
10 = almost completely dense ink coverage

Consider:
- solid black areas
- filled shapes
- large dark regions
- overall percentage of the tattoo occupied by ink

IMPORTANT:

Thin outlines with lots of empty space should have low ink density.

Do not confuse detail with ink density.

A highly detailed fine-line tattoo can have high detail but low ink density.

==================================================
COLOR COMPLEXITY
==================================================

Return an integer from 0 to 3.

0 = black and grey only
1 = one simple color
2 = multiple colors
3 = highly complex color work

Only evaluate colors belonging to the tattoo.

Ignore skin color and background colors.

==================================================
LINE COMPLEXITY
==================================================

Return an integer from 1 to 10.

This measures the technical complexity of the tattoo linework.

1 = extremely simple linework
2 = very simple linework
3 = simple linework
4 = moderately simple linework
5 = moderate linework
6 = moderately complex linework
7 = complex linework
8 = very complex linework
9 = extremely complex linework
10 = exceptionally complex linework

Consider:
- number of lines
- line intersections
- line density
- precision
- curves
- geometric precision
- variation in line thickness
- fine-line precision
- overlapping structures
- intricate patterns

IMPORTANT:

Do not automatically give fine-line tattoos a high line complexity.

A simple heart made with one thin line should have lineComplexity around 1 or 2.

A complex fine-line composition with many precise intersecting lines can have lineComplexity 7 or higher.

==================================================
ELEMENT COUNT
==================================================

Return the approximate number of MAJOR visual elements.

Count meaningful independent components.

Examples:

A heart with one flower:
elementCount = 2

A face with a rose and leaves:
elementCount = 3

A simple heart outline:
elementCount = 1

Do not count every individual line.

Do not count tiny decorative marks as separate major elements.

Return an integer from 1 to 50.

==================================================
CONSISTENCY RULES
==================================================

The values must make logical sense together.

IMPORTANT RELATIONSHIPS:

If complexity is 1:
detailLevel should usually be between 1 and 3.
lineComplexity should usually be between 1 and 3.
shadingLevel should usually be between 1 and 2.
inkDensity should usually be between 1 and 3.

If complexity is 2:
detailLevel should usually be between 2 and 4.
lineComplexity should usually be between 2 and 4.
shadingLevel should usually be between 1 and 4.

If complexity is 3:
detailLevel can reasonably range from 3 to 6.
lineComplexity can reasonably range from 3 to 6.
shadingLevel can reasonably range from 2 to 6.

If complexity is 4:
detailLevel should usually be between 5 and 8.
lineComplexity should usually be between 5 and 8.
shadingLevel can reasonably be between 4 and 9.

If complexity is 5:
detailLevel should usually be between 7 and 10.
lineComplexity should usually be between 7 and 10.
shadingLevel can reasonably be between 6 and 10.

These are guidelines, not mathematical requirements.

Do not artificially make every value equal.

Different characteristics must be evaluated independently.

==================================================
IMPORTANT EXAMPLES
==================================================

Example 1:

A simple heart drawn with a single thin outline.

Expected reasoning:
- very few elements
- almost no detail
- almost no shading
- very low ink coverage
- simple linework

Possible result:

{
  "style": "minimalism",
  "complexity": 1,
  "detailLevel": 1,
  "shadingLevel": 1,
  "inkDensity": 1,
  "colorComplexity": 0,
  "lineComplexity": 1,
  "elementCount": 1
}

Example 2:

A heart outline combined with a small flower, both using delicate thin lines.

Expected characteristics:
- simple composition
- two major elements
- low detail
- almost no shading
- low ink density
- simple fine linework

Possible result:

{
  "style": "fine-line",
  "complexity": 2,
  "detailLevel": 2,
  "shadingLevel": 1,
  "inkDensity": 2,
  "colorComplexity": 0,
  "lineComplexity": 2,
  "elementCount": 2
}

Example 3:

A highly realistic human portrait with skin texture, hair, complex shadows and smooth tonal transitions.

Expected characteristics:
- realism
- many visual details
- complex shading
- high technical difficulty
- high detail
- high line and tonal complexity

Possible result:

{
  "style": "realism",
  "complexity": 5,
  "detailLevel": 9,
  "shadingLevel": 9,
  "inkDensity": 7,
  "colorComplexity": 0,
  "lineComplexity": 7,
  "elementCount": 1
}

Example 4:

A detailed black-and-grey tattoo containing several realistic objects with extensive shading.

Expected characteristics:
- black-and-grey
- multiple major elements
- high detail
- substantial shading
- significant ink coverage
- complex composition

This should normally be complexity 4 or 5, NOT 3.

==================================================
FINAL INSTRUCTION
==================================================

Look at the image carefully.

Evaluate the actual tattoo artwork.

Do not rely on generic assumptions.

Do not default to the middle value.

Do not describe the image.

Do not explain your reasoning.

Do not write any text before or after the JSON.

Return ONLY valid JSON.

Use EXACTLY this structure:

{
  "style": "unknown",
  "complexity": 1,
  "detailLevel": 1,
  "shadingLevel": 1,
  "inkDensity": 1,
  "colorComplexity": 0,
  "lineComplexity": 1,
  "elementCount": 1
}
`;

export async function analyzeTattoo(
  file: File,
): Promise<TattooAnalysis> {
  await loadModel();

  if (!processor || !model) {
    throw new Error(
      "El modelo de IA no pudo inicializarse.",
    );
  }

  try {
    console.log(
      "Cargando imagen para Qwen3-VL...",
    );

    const image = await load_image_from_file(
      file,
    );

    console.log(
      "Imagen cargada correctamente.",
    );

    /*
     * Reducimos la imagen para mantener
     * el consumo de memoria razonable.
     *
     * Qwen3-VL puede trabajar con imágenes
     * visualmente complejas, pero no necesitamos
     * enviar una fotografía enorme.
     */
    const resizedImage =
      await image.resize(
        448,
        448,
      );

    console.log(
      "Imagen redimensionada a 448x448.",
    );

    const conversation = [
      {
        role: "user",
        content: [
          {
            type: "image",
          },
          {
            type: "text",
            text: PROMPT,
          },
        ],
      },
    ];

    /*
     * Construimos el prompt multimodal
     * utilizando el chat template del modelo.
     */
    const text =
      processor.apply_chat_template(
        conversation,
        {
          add_generation_prompt: true,
        },
      );

    console.log(
      "Prompt multimodal generado.",
    );

    /*
     * IMPORTANTE:
     *
     * Qwen3-VL espera la imagen como segundo
     * argumento del processor.
     */
    const inputs =
      await processor(
        text,
        resizedImage,
      );

    if (
      !inputs ||
      typeof inputs !== "object"
    ) {
      throw new Error(
        "El processor no generó inputs válidos.",
      );
    }

    console.log(
      "Inputs preparados:",
      Object.keys(inputs),
    );

    const visualKeys =
      Object.keys(inputs).filter(
        (key) =>
          key.includes("pixel") ||
          key.includes("image") ||
          key.includes("vision"),
      );

    console.log(
      "Inputs visuales:",
      visualKeys,
    );

    if (
      visualKeys.length === 0
    ) {
      throw new Error(
        "Qwen3-VL no generó inputs visuales.",
      );
    }

    console.log(
      "✓ La imagen está entrando a Qwen3-VL.",
    );

    /*
     * Generación determinista.
     *
     * No queremos creatividad.
     * Queremos una evaluación consistente.
     */
    const output =
      await model.generate({
        ...inputs,

        max_new_tokens: 300,

        do_sample: false,

        repetition_penalty: 1.05,
      });

    console.log(
      "Respuesta del modelo:",
      output,
    );

    /*
     * El modelo devuelve los tokens completos:
     *
     * prompt + respuesta
     *
     * Por eso eliminamos los tokens
     * correspondientes al prompt antes
     * de decodificar.
     */
    const inputLength =
      inputs.input_ids.dims.at(-1);

    const generatedTokens =
      output.slice(
        null,
        [
          inputLength,
          null,
        ],
      );

    const decoded =
      processor.batch_decode(
        generatedTokens,
        {
          skip_special_tokens: true,
        },
      );

    if (
      !decoded ||
      decoded.length === 0
    ) {
      throw new Error(
        "La IA no devolvió ningún resultado.",
      );
    }

    const generatedText =
      decoded[0].trim();

    console.log(
      "Texto generado por Qwen3-VL:",
      generatedText,
    );

    return parseAnalysis(
      generatedText,
    );
  } catch (error) {
    console.error(
      "Error analizando tatuaje:",
      error,
    );

    throw error;
  }
}

/**
 * Convierte el File del navegador
 * en una imagen compatible con Transformers.js.
 */
async function load_image_from_file(
  file: File,
): Promise<any> {
  const arrayBuffer =
    await file.arrayBuffer();

  const uint8Array =
    new Uint8Array(
      arrayBuffer,
    );

  return await RawImage.fromBlob(
    new Blob(
      [
        uint8Array,
      ],
      {
        type:
          file.type ||
          "image/jpeg",
      },
    ),
  );
}

function parseAnalysis(
  text: string,
): TattooAnalysis {
  console.log(
    "Intentando interpretar respuesta:",
    text,
  );

  /*
   * Primero buscamos JSON.
   *
   * Qwen debería devolver únicamente JSON,
   * pero mantenemos cierta tolerancia por si
   * añade markdown.
   */
  let jsonText = text.trim();

  /*
   * Eliminar posibles bloques markdown:
   *
   * ```json
   * {...}
   * ```
   */
  jsonText =
    jsonText
      .replace(
        /^```json\s*/i,
        "",
      )
      .replace(
        /^```\s*/i,
        "",
      )
      .replace(
        /\s*```$/i,
        "",
      )
      .trim();

  /*
   * Si todavía existe texto alrededor,
   * buscamos el primer objeto JSON.
   */
  const jsonStart =
    jsonText.indexOf("{");

  const jsonEnd =
    jsonText.lastIndexOf("}");

  if (
    jsonStart !== -1 &&
    jsonEnd !== -1 &&
    jsonEnd > jsonStart
  ) {
    jsonText =
      jsonText.slice(
        jsonStart,
        jsonEnd + 1,
      );
  }

  let parsed:
    Record<string, unknown>;

  try {
    parsed =
      JSON.parse(jsonText);
  } catch {
    console.error(
      "Respuesta completa de Qwen3-VL:",
      text,
    );

    throw new Error(
      "La IA no devolvió un JSON válido.",
    );
  }

  const style =
    typeof parsed.style === "string"
      ? parsed.style
      : "unknown";

  const allowedStyles = [
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

  const normalizedStyle =
    allowedStyles.includes(
      style,
    )
      ? style
      : "unknown";

  return {
    style:
      normalizedStyle,

    complexity:
      clamp(
        Number(
          parsed.complexity,
        ),
        1,
        5,
      ),

    detailLevel:
      clamp(
        Number(
          parsed.detailLevel,
        ),
        1,
        10,
      ),

    shadingLevel:
      clamp(
        Number(
          parsed.shadingLevel,
        ),
        1,
        10,
      ),

    inkDensity:
      clamp(
        Number(
          parsed.inkDensity,
        ),
        1,
        10,
      ),

    colorComplexity:
      clamp(
        Number(
          parsed.colorComplexity,
        ),
        0,
        3,
      ),

    /*
     * Si TattooAnalysis todavía no tiene
     * estos campos, TypeScript nos lo dirá.
     *
     * No los hacemos obligatorios todavía
     * para no romper el resto de la aplicación.
     */
    ...(Number.isFinite(
      Number(
        parsed.lineComplexity,
      ),
    )
      ? {
          lineComplexity:
            clamp(
              Number(
                parsed.lineComplexity,
              ),
              1,
              10,
            ),
        }
      : {}),

    ...(Number.isFinite(
      Number(
        parsed.elementCount,
      ),
    )
      ? {
          elementCount:
            clamp(
              Number(
                parsed.elementCount,
              ),
              1,
              50,
            ),
        }
      : {}),
  } as TattooAnalysis;
}

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.max(
    min,
    Math.min(
      max,
      Math.round(value),
    ),
  );
}