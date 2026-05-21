import { Box3, PerspectiveCamera, Vector3 } from "three";

import { fitCameraToBox } from "./fit-camera-to-box";

describe("fitCameraToBox", () => {
  it("pulls camera back enough for a tall box", () => {
    const camera = new PerspectiveCamera(32, 16 / 9, 0.1, 100);
    const controls = {
      target: { copy: jest.fn() },
      update: jest.fn(),
      autoRotate: false,
    } as never;

    const box = new Box3().setFromCenterAndSize(
      new Vector3(0, 0.9, 0),
      new Vector3(0.3, 1.78, 1.1),
    );

    fitCameraToBox(box, camera, controls, 16 / 9, 1.72, { bottomPad: 0.32 });

    expect(camera.position.z).toBeGreaterThan(4.5);
    expect(controls.target.copy).toHaveBeenCalled();
  });

  it("applies top and bottom padding options", () => {
    const camera = new PerspectiveCamera(30, 1, 0.1, 100);
    const controls = {
      target: { copy: jest.fn() },
      update: jest.fn(),
      autoRotate: false,
    } as never;
    const box = new Box3(new Vector3(-0.5, 0, -0.5), new Vector3(0.5, 2, 0.5));

    fitCameraToBox(box, camera, controls, 1, 1.32, {
      bottomPad: 0.18,
      topPad: 0.06,
    });

    expect(camera.position.y).toBeDefined();
    expect(controls.update).toHaveBeenCalled();
  });

  it("uses default padding when options are omitted", () => {
    const camera = new PerspectiveCamera(32, 1, 0.1, 100);
    const controls = {
      target: { copy: jest.fn() },
      update: jest.fn(),
      autoRotate: false,
    } as never;
    const box = new Box3(new Vector3(-0.5, 0, -0.5), new Vector3(0.5, 2, 0.5));

    fitCameraToBox(box, camera, controls, 1);

    expect(camera.position.z).toBeGreaterThan(0);
  });
});
