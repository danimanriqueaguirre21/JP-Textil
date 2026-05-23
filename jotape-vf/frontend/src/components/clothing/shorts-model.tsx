"use client";

import { ClothingModel } from "@/components/clothing/clothing-model";
import { preloadClothing } from "@/components/clothing/preload-clothing";
import { CLOTHING_SHORTS_GLB } from "@/lib/clothing/clothing-paths";

type Props = {
  color?: string;
  visible?: boolean;
};

export function ShortsModel({
  color = "#ececec",
  visible = true,
}: Props) {
  return (
    <ClothingModel
      url={CLOTHING_SHORTS_GLB}
      color={color}
      visible={visible}
    />
  );
}

preloadClothing(CLOTHING_SHORTS_GLB);
