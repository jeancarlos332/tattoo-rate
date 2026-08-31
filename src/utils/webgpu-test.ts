export async function testWebGPU(): Promise<string[]> {
  const results: string[] = [];

  results.push(
    `WebGPU: ${
      "gpu" in navigator
        ? "disponible"
        : "NO disponible"
    }`,
  );

  if (!("gpu" in navigator)) {
    results.push(
      "❌ Este navegador no tiene WebGPU disponible.",
    );

    return results;
  }

  try {
    const gpu = (
      navigator as Navigator & {
        gpu: GPU;
      }
    ).gpu;

    results.push(
      "⏳ Solicitando GPU Adapter...",
    );

    const adapter =
      await gpu.requestAdapter();

    if (!adapter) {
      results.push(
        "❌ No se pudo obtener el GPU Adapter.",
      );

      return results;
    }

    results.push(
      "✅ GPU Adapter obtenido.",
    );

    results.push(
      "⏳ Creando GPU Device...",
    );

    const device =
      await adapter.requestDevice();

    if (!device) {
      results.push(
        "❌ No se pudo crear el GPU Device.",
      );

      return results;
    }

    results.push(
      "✅ GPU Device creado correctamente.",
    );

    results.push(
      "🎉 WebGPU funciona correctamente.",
    );
  } catch (error) {
    results.push(
      `❌ Error WebGPU: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`,
    );
  }

  return results;
}