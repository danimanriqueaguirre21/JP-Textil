const RETRY_DELAYS_MS = [0, 3000, 6000];

function isChunkLoadFailure(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return /ChunkLoadError|Loading chunk|chunk.*failed|timeout/i.test(err.message);
}

/**
 * Carga diferida de FittingScene (Three.js). Reintenta si el chunk tarda en compilar en dev.
 */
export async function loadFittingScene() {
  let lastError: unknown;

  for (const delay of RETRY_DELAYS_MS) {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    try {
      const mod = await import(
        /* webpackChunkName: "fitting-scene" */
        "@/components/virtual-fitting/3d/fitting-scene"
      );
      return mod.FittingScene;
    } catch (err) {
      lastError = err;
      if (!isChunkLoadFailure(err)) throw err;
    }
  }

  throw lastError;
}

/** Precalienta el chunk en segundo plano (p. ej. al montar el panel). */
export function preloadFittingScene(): void {
  void loadFittingScene().catch(() => {
    /* El panel mostrará loading / reintentará al renderizar */
  });
}
