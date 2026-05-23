"use client";

import { ClothingModel } from "@/components/clothing/clothing-model";
import { preloadClothing } from "@/components/clothing/preload-clothing";
import { CLOTHING_TSHIRT_GLB } from "@/lib/clothing/clothing-paths";

type Props = {
  color?: string;
  visible?: boolean;
};

export function TShirtModel({
  color = "#f2f2f2",
  visible = true,
}: Props) {
  return (
    <ClothingModel
      url={CLOTHING_TSHIRT_GLB}
      color={color}
      visible={visible}
    />
  );
}

preloadClothing(CLOTHING_TSHIRT_GLB);
