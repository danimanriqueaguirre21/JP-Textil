import { Box3, PerspectiveCamera, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export type FitCameraOptions = {
  /** Metros extra bajo los pies para que no se corten en pantalla. */
  bottomPad?: number;
  /** Metros extra sobre la cabeza. */
  topPad?: number;
};

/** Encuadra cámara frontal con todo el cuerpo visible (pies incluidos). */
export function fitCameraToBox(
  box: Box3,
  camera: PerspectiveCamera,
  controls: OrbitControlsImpl,
  aspect: number,
  margin = 1.35,
  options: FitCameraOptions = {},
): void {
  const bottomPad = options.bottomPad ?? 0.2;
  const topPad = options.topPad ?? 0.06;

  const size = box.getSize(new Vector3());
  const fitHeight = size.y + bottomPad + topPad;

  const center = new Vector3();
  box.getCenter(center);
  center.y = box.min.y + size.y * 0.5 + (topPad - bottomPad) * 0.5;

  const vFov = (camera.fov * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

  const distY = fitHeight / 2 / Math.tan(vFov / 2);
  const distX = size.x / 2 / Math.tan(hFov / 2);
  const distZ = size.z / 2 / Math.tan(hFov / 2);
  const distance = margin * Math.max(distY, distX, distZ, 0.01);

  camera.position.set(center.x, center.y, center.z + distance);
  camera.lookAt(center);
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.minDistance = distance * 0.45;
  controls.maxDistance = distance * 2.8;
  controls.autoRotate = false;
  controls.update();
}
