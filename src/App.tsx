import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";

import { ImageUploader } from "./components/ImageUploader";
import { SizeInput } from "./components/SizeInput";
import { QuoteResult } from "./components/QuoteResult";

import { analyzeTattoo, type AIStatus } from "./services/tattoo-ai";
import { calculateQuote } from "./services/pricing";
import { testWebGPU } from "./utils/webgpu-test";
import { testQwenModel } from "./services/tattoo-ai";

import {
  type TattooZone,
  type TattooSide,
  type TattooCoverage,
  hasCoverage,
  hasSide,
  requiresSize,
} from "./types/tattoo-pricing";

import type {
  TattooAnalysis,
  TattooSize,
  QuoteResult as QuoteResultType,
} from "./types/tattoo";

function App() {
  const [gpuTest, setGpuTest] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);

  const [zone, setZone] = useState<TattooZone>("wrist_to_elbow");

  const [side, setSide] = useState<TattooSide>("outer");

  const [coverage, setCoverage] = useState<TattooCoverage>("medium");

  type BodyBuild = "slim" | "normal" | "thick";
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);

  const [bodyBuild, setBodyBuild] = useState<BodyBuild>("normal");

  const [size, setSize] = useState<TattooSize>({
    width: 0,
    height: 0,
  });

  const [analysis, setAnalysis] = useState<TattooAnalysis | null>(null);

  const [quote, setQuote] = useState<QuoteResultType | null>(null);

  const [loading, setLoading] = useState(false);

  /**
   * Determina si la zona necesita
   * que el usuario coloque centímetros.
   *
   * Actualmente solo "Otra zona".
   */
  const needsSize = requiresSize(zone);

  /**
   * Determina si se debe mostrar
   * exterior / interior.
   */
  const showSide = hasSide(zone);

  /**
   * Determina si se debe mostrar
   * cobertura.
   */
  const showCoverage = hasCoverage(zone);

  /**
   * Genera la cotización.
   */
  async function handleQuote() {
    if (!image) {
      return;
    }

    /**
     * Solo validamos centímetros
     * cuando la zona realmente los necesita.
     */
    if (needsSize && (size.width <= 0 || size.height <= 0)) {
      return;
    }

    try {
      setLoading(true);
      setQuote(null);

      /**
       * Analizamos primero la referencia
       * con la IA.
       */
      const result = await analyzeTattoo(image, (message) => {
        setAiStatus(message);
      });

      setAnalysis(result);

      /**
       * Luego calculamos el precio
       * utilizando:
       *
       * - zona
       * - lado
       * - cobertura
       * - tamaño cuando corresponda
       * - análisis IA
       */
      const calculatedQuote = calculateQuote({
        size,
        analysis: result,
        zone,
        side,
        coverage,
        bodyBuild,
      });

      setQuote(calculatedQuote);
    } catch (error) {
      console.error("Error generando cotización:", error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Cuando cambia la imagen,
   * limpiamos la cotización anterior.
   */
  function handleImageChange(file: File | null) {
    setImage(file);
    setAnalysis(null);
    setQuote(null);
  }

  /**
   * Cuando cambia la zona,
   * limpiamos la cotización anterior.
   */
  function handleZoneChange(newZone: TattooZone) {
    setZone(newZone);

    setAnalysis(null);
    setQuote(null);

    /**
     * Valores por defecto.
     */
    setSide("outer");
    setCoverage("medium");
    setSize({
      width: 0,
      height: 0,
    });
  }

  /**
   * Para zonas normales no necesitamos
   * centímetros.
   *
   * Para custom sí.
   */
  const canQuote =
    image !== null &&
    (!needsSize || (size.width > 0 && size.height > 0)) &&
    !loading;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto min-h-screen w-full max-w-md px-4 py-6 sm:px-6">
        {/* HEADER */}
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-zinc-950">
              <Sparkles className="h-5 w-5" />
            </div>

            <span className="text-sm font-semibold tracking-wide text-zinc-400">
              TATTOO RATE
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Cotiza tu tatuaje.
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Sube una referencia, selecciona la zona y obtén una estimación
            basada en el trabajo artístico del diseño.
          </p>
        </header>

        <div className="space-y-4">
          {/* IMAGEN */}
          <ImageUploader onImageChange={handleImageChange} />

          {image && (
            <>
              {/* ZONA */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Zona del cuerpo
                </label>

                <select
                  value={zone}
                  onChange={(event) =>
                    handleZoneChange(event.target.value as TattooZone)
                  }
                  className="min-h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-white outline-none"
                >
                  {/* BRAZO */}
                  <optgroup label="Brazo">
                    <option value="wrist_to_elbow">Muñeca a codo</option>

                    <option value="elbow_to_shoulder">Codo a hombro</option>

                    <option value="wrist_to_shoulder">Muñeca a hombro</option>

                    <option value="arm_full">Brazo completo</option>

                    <option value="forearm">Antebrazo</option>

                    <option value="upper_arm">Brazo superior</option>
                  </optgroup>

                  {/* PIERNA */}
                  <optgroup label="Pierna">
                    <option value="hip_to_knee">Cadera a rodilla</option>

                    <option value="knee_to_ankle">Rodilla a tobillo</option>

                    <option value="ankle_to_hip">Tobillo a cadera</option>

                    <option value="leg_full">Pierna completa</option>

                    <option value="thigh">Muslo</option>

                    <option value="calf">Pantorrilla</option>
                  </optgroup>

                  {/* TORSO */}
                  <optgroup label="Torso">
                    <option value="chest">Pecho</option>
                  </optgroup>

                  {/* ESPALDA */}
                  <optgroup label="Espalda">
                    <option value="back_upper">
                      Parte superior de espalda
                    </option>

                    <option value="back_full">Espalda completa</option>
                  </optgroup>

                  {/* OTRA */}
                  <optgroup label="Otra">
                    <option value="custom">Otra zona</option>
                  </optgroup>
                </select>
              </div>

              {/* PARTE EXTERIOR / INTERIOR */}
              {showSide && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Parte
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSide("outer")}
                      className={`min-h-12 rounded-2xl border text-sm font-medium transition ${
                        side === "outer"
                          ? "border-white bg-white text-zinc-950"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      Exterior
                    </button>

                    <button
                      type="button"
                      onClick={() => setSide("inner")}
                      className={`min-h-12 rounded-2xl border text-sm font-medium transition ${
                        side === "inner"
                          ? "border-white bg-white text-zinc-950"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      Interior
                    </button>
                  </div>
                </div>
              )}

              {/* CONTEXTURA */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Contextura
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBodyBuild("slim")}
                    className={`min-h-12 rounded-2xl border text-sm font-medium transition ${
                      bodyBuild === "slim"
                        ? "border-white bg-white text-zinc-950"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400"
                    }`}
                  >
                    Delgada
                  </button>

                  <button
                    type="button"
                    onClick={() => setBodyBuild("normal")}
                    className={`min-h-12 rounded-2xl border text-sm font-medium transition ${
                      bodyBuild === "normal"
                        ? "border-white bg-white text-zinc-950"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400"
                    }`}
                  >
                    Normal
                  </button>

                  <button
                    type="button"
                    onClick={() => setBodyBuild("thick")}
                    className={`min-h-12 rounded-2xl border text-sm font-medium transition ${
                      bodyBuild === "thick"
                        ? "border-white bg-white text-zinc-950"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400"
                    }`}
                  >
                    Gruesa
                  </button>
                </div>
              </div>

              {/* COBERTURA */}
              {showCoverage && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Cobertura de la zona
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCoverage("small")}
                      className={`min-h-12 rounded-2xl border text-sm font-medium transition ${
                        coverage === "small"
                          ? "border-white bg-white text-zinc-950"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      Pequeña
                    </button>

                    <button
                      type="button"
                      onClick={() => setCoverage("medium")}
                      className={`min-h-12 rounded-2xl border text-sm font-medium transition ${
                        coverage === "medium"
                          ? "border-white bg-white text-zinc-950"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      Media
                    </button>

                    <button
                      type="button"
                      onClick={() => setCoverage("large")}
                      className={`min-h-12 rounded-2xl border text-sm font-medium transition ${
                        coverage === "large"
                          ? "border-white bg-white text-zinc-950"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      Grande
                    </button>

                    <button
                      type="button"
                      onClick={() => setCoverage("full")}
                      className={`min-h-12 rounded-2xl border text-sm font-medium transition ${
                        coverage === "full"
                          ? "border-white bg-white text-zinc-950"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      Completa
                    </button>
                  </div>
                </div>
              )}

              {/* CENTÍMETROS */}
              {needsSize && <SizeInput value={size} onChange={setSize} />}

              {/* COTIZAR */}
              <button
                type="button"
                disabled={!canQuote}
                onClick={handleQuote}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 font-semibold text-zinc-950 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Analizando diseño...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Cotizar tatuaje
                  </>
                )}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={async () => {
              const result = await testWebGPU();
              setGpuTest(result);
            }}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-3 text-white"
          >
            Probar WebGPU
          </button>

          {gpuTest.length > 0 && (
            <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-zinc-900 p-4 text-xs text-white">
              {gpuTest.join("\n")}
            </pre>
          )}

          <button
            type="button"
            onClick={async () => {
              alert("1️⃣ El botón funciona");

              const result = await testQwenModel((message) => {
                alert(message);
              });

              alert(result);
            }}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            Probar carga de IA
          </button>

          {aiStatus && (
            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-sm font-medium text-white">
                {aiStatus === "loading-processor" &&
                  "🧠 Preparando procesador de IA..."}

                {aiStatus === "loading-model" &&
                  "⬇️ Preparando modelo de IA... Esto puede tardar la primera vez."}

                {aiStatus === "model-ready" &&
                  "✅ Inteligencia artificial lista."}

                {aiStatus === "loading-image" && "🖼️ Preparando imagen..."}

                {aiStatus === "analyzing" && "🔍 Analizando tatuaje..."}

                {aiStatus === "completed" && "✅ Análisis completado."}

                {aiStatus === "error" &&
                  "❌ Ocurrió un error al analizar el tatuaje."}
              </p>
            </div>
          )}

          {/* RESULTADO */}
          {quote && analysis && (
            <QuoteResult quote={quote} analysis={analysis} />
          )}
        </div>

        {/* FOOTER */}
        <footer className="py-8 text-center">
          <p className="text-xs leading-5 text-zinc-700">
            La cotización es una estimación. El precio final puede variar según
            el diseño definitivo y la valoración del artista.
          </p>
        </footer>
      </div>
    </main>
  );
}

export default App;
