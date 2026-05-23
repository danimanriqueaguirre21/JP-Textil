"use client";

import type { ThreeElements } from "@react-three/fiber";

import { ShortsModel } from "@/components/clothing/shorts-model";
import { TShirtModel } from "@/components/clothing/t-shirt-model";

type GroupProps = ThreeElements["group"];

type Props = GroupProps & {
  showTshirt?: boolean;
  showShorts?: boolean;
  tshirtColor?: string;
  shortsColor?: string;
};

export function DefaultOutfit({
  showTshirt = true,
  showShorts = true,
  tshirtColor,
  shortsColor,
  ...props
}: Props) {
  return (
    <group {...props}>
      <TShirtModel color={tshirtColor} visible={showTshirt} />
      <ShortsModel color={shortsColor} visible={showShorts} />
    </group>
  );
}
