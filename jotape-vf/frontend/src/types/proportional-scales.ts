/** Escalas proporcionales aplicadas al rig (1 = avatar base). */
export type ProportionalAvatarScales = {
  shoulderScaleX: number;
  chestScaleX: number;
  waistScaleX: number;
  hipScaleX: number;
  torsoScaleY: number;
  legScaleY: number;
  bodyDepthZ: number;
  chestDepthZ: number;
  abdomenDepthZ: number;
  armScaleX: number;
  thighScaleX: number;
};

export type ProportionalScaleInput = {
  heightCm: number;
  shoulderWidthCm: number;
  chestCm: number;
  waistCm: number;
  hipWidthCm: number;
  depthCm: number;
  abdomenDepthCm?: number;
  thighWidthCm?: number;
  torsoLengthCm: number;
  legLengthCm: number;
  poseQuality: number;
  hasSideView: boolean;
  bodyType?: import("@/types/hybrid-body-scan").BodyType;
  bodyFatEstimate?: number;
  segmentationUsed?: boolean;
};

export type ProportionalScaleDebug = {
  alturaUsuario: number;
  hombrosUsuario: number;
  cinturaUsuario: number;
  caderaUsuario: number;
  profundidadTorso: number;
  profundidadAbdomen: number;
  bodyType: string;
  bodyFatEstimate: number;
  shoulderScaleX: number;
  chestScaleX: number;
  waistScaleX: number;
  hipScaleX: number;
  torsoScaleY: number;
  legScaleY: number;
  bodyDepthZ: number;
  chestDepthZ: number;
  abdomenDepthZ: number;
  armScaleX: number;
  thighScaleX: number;
  poseQuality: number;
  medidasIgnoradas: string[];
  /** Escalas sin clamp visual (modo diagnóstico). */
  rawScales?: ProportionalAvatarScales;
  visualPreset?: ProportionalAvatarScales;
  measuredClamped?: ProportionalAvatarScales;
  blendWeight?: number;
};
