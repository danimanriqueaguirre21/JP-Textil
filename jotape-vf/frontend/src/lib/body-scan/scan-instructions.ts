import type { LucideIcon } from "lucide-react";
import {
  Camera,
  MoveHorizontal,
  Scan,
  Sparkles,
  Sun,
} from "lucide-react";

export type BodyScanInstruction = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

/** Guía visual mostrada durante todo el flujo de captura. */
export const BODY_SCAN_INSTRUCTIONS: BodyScanInstruction[] = [
  {
    id: "full-body",
    title: "Cuerpo completo visible",
    description: "De la cabeza a los pies dentro del marco, sin recortes.",
    icon: Scan,
  },
  {
    id: "arms",
    title: "Brazos ligeramente separados",
    description: "Deja un pequeño espacio entre brazos y torso para medir hombros.",
    icon: MoveHorizontal,
  },
  {
    id: "light",
    title: "Buena iluminación",
    description: "Luz frontal uniforme; evita contraluces y sombras fuertes.",
    icon: Sun,
  },
  {
    id: "background",
    title: "Fondo limpio",
    description: "Pared lisa o fondo neutro; sin personas ni objetos que tapen el cuerpo.",
    icon: Sparkles,
  },
  {
    id: "camera",
    title: "Cámara recta",
    description: "Coloca el móvil a la altura del pecho, vertical y sin inclinación.",
    icon: Camera,
  },
];

export const BODY_SCAN_VIEW_HINTS: Record<
  "front" | "side",
  { title: string; subtitle: string }
> = {
  front: {
    title: "Foto frontal",
    subtitle: "Mira de frente a la cámara, pies separados al ancho de hombros.",
  },
  side: {
    title: "Foto lateral",
    subtitle: "Gira 90° hacia tu izquierda, mismo encuadre de cuerpo completo.",
  },
};
