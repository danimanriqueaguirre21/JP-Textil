"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tryOnInputClass } from "@/components/try-on/try-on-ui";
import { useBodyProfile } from "@/hooks/use-body-profile";

type Props = {
  onSaved?: () => void;
};

export function BodyProfileForm({ onSaved }: Props) {
  const { profile, update, hydrated } = useBodyProfile();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  useEffect(() => {
    if (!hydrated) return;
    setHeight(String(profile.heightCm));
    setWeight(String(profile.weightKg));
  }, [hydrated, profile.heightCm, profile.weightKg]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const h = Number(height);
    const w = Number(weight);
    if (!h || h < 130 || h > 220) return;
    update({
      heightCm: h,
      weightKg: w && w >= 30 && w <= 250 ? w : 0,
    });
    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-md gap-4">
      <div className="space-y-2">
        <label
          htmlFor="body-height"
          className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
        >
          Altura (cm)
        </label>
        <Input
          id="body-height"
          type="number"
          min={130}
          max={220}
          className={tryOnInputClass}
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          required
        />
        <p className="text-xs text-zinc-500">
          Usada para escalar medidas del escaneo y el avatar 3D.
        </p>
      </div>
      <div className="space-y-2">
        <label
          htmlFor="body-weight"
          className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
        >
          Peso (kg) — opcional
        </label>
        <Input
          id="body-weight"
          type="number"
          min={30}
          max={250}
          className={tryOnInputClass}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Opcional"
        />
        <p className="text-xs text-zinc-500">
          Mejora la estimación de tipo corporal si lo indicas.
        </p>
      </div>
      <Button type="submit" className="w-fit rounded-full">
        Guardar perfil corporal
      </Button>
    </form>
  );
}
