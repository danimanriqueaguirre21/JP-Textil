/** En dev, volumen por huesos (rápido). Morphs: `NEXT_PUBLIC_AVATAR_BODY_MORPHS=true` */
export function useBoneVolumeOnly(): boolean {
  if (process.env.NEXT_PUBLIC_AVATAR_BODY_MORPHS === "true") return false;
  return process.env.NODE_ENV === "development";
}

/**
 * Avatar CC no usa ropa GLB externa (buildOutfitRig detecta CC_Base_*).
 * Solo cargar prendas si se pide explícitamente (basemesh legacy).
 */
export function shouldLoadGarmentGltfs(): boolean {
  if (process.env.NEXT_PUBLIC_AVATAR_LOAD_GARMENTS === "true") return true;
  return false;
}

export function useDevLightClothingUrls(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_AVATAR_LOAD_GARMENTS === "true" &&
    process.env.NEXT_PUBLIC_CLOTHING_USE_FULL_GLB !== "true"
  );
}

export function shouldPreloadAllAvatarAssets(): boolean {
  return process.env.NODE_ENV === "production";
}
