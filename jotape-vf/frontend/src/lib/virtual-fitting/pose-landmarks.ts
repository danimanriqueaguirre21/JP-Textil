/** Índices MediaPipe Pose (https://developers.google.com/mediapipe/solutions/vision/pose_landmarker). */
export const POSE_LANDMARK = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

export const KEY_LANDMARK_INDICES = [
  POSE_LANDMARK.NOSE,
  POSE_LANDMARK.LEFT_SHOULDER,
  POSE_LANDMARK.RIGHT_SHOULDER,
  POSE_LANDMARK.LEFT_HIP,
  POSE_LANDMARK.RIGHT_HIP,
  POSE_LANDMARK.LEFT_ANKLE,
  POSE_LANDMARK.RIGHT_ANKLE,
] as const;
