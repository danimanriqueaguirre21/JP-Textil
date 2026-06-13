/** Perfil corporal del usuario (altura/peso para escaneo y probador). */
export type BodyProfile = {
  heightCm: number;
  weightKg: number;
  updatedAt: string;
};

export type MedidaUsuarioApi = {
  id: string;
  altura_cm: number;
  peso_kg: number;
  pecho_cm: number | null;
  cintura_cm: number | null;
  cadera_cm: number | null;
  hombro_cm: number | null;
  fuente: string;
  es_actual: boolean;
  medido_en: string;
};
