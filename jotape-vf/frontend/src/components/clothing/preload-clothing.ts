import { useGLTF } from "@react-three/drei";

/** Precarga un GLB de prenda (llamar a nivel de módulo o en efecto). */
export function preloadClothing(url: string): void {
  useGLTF.preload(url);
}
