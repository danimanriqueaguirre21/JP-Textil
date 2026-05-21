import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
} from "three";

import {
  GARMENT_SHORTS_ROOT,
  GARMENT_TSHIRT_ROOT,
  fitGarmentRootToBody,
  mergeDefaultOutfit,
  removeAllGarmentsFromAvatar,
} from "./garment-glb";
import { garmentBodyRegion } from "./garment-models";

function boxGeometry(minY: number, maxY: number): BufferGeometry {
  const geo = new BufferGeometry();
  const positions = new Float32Array([
    -0.2, minY, -0.1,
    0.2, minY, 0.1,
    -0.2, maxY, -0.1,
    0.2, maxY, 0.1,
  ]);
  geo.setAttribute("position", new BufferAttribute(positions, 3));
  geo.computeBoundingBox();
  return geo;
}

describe("garment-glb", () => {
  it("parents tshirt and shorts on body mesh", () => {
    const avatarRoot = new Group();
    const body = new Mesh(boxGeometry(0, 2));
    body.name = "male_basemesh";
    avatarRoot.add(body);

    mergeDefaultOutfit(avatarRoot, body, {
      profile: { ease: 1, offset: 0 },
      gender: "male",
    });

    expect(body.getObjectByName(GARMENT_TSHIRT_ROOT)).toBeDefined();
    expect(body.getObjectByName(GARMENT_SHORTS_ROOT)).toBeDefined();

    removeAllGarmentsFromAvatar(avatarRoot);
    expect(body.getObjectByName(GARMENT_TSHIRT_ROOT)).toBeUndefined();
  });

  it("fits soft garment root to body region", () => {
    const body = new Mesh(boxGeometry(0, 2));
    const garmentRoot = new Group();
    const g = new BufferGeometry();
    g.setAttribute(
      "position",
      new BufferAttribute(
        new Float32Array([
          -0.2, -0.25, -0.1, 0.2, -0.25, 0.1, -0.2, 0.25, -0.1, 0.2, 0.25, 0.1,
        ]),
        3,
      ),
    );
    garmentRoot.add(new Mesh(g));

    fitGarmentRootToBody(
      body,
      garmentRoot,
      garmentBodyRegion("male", "tshirt"),
      { ease: 1, offset: 0 },
    );

    expect(garmentRoot.scale.x).toBeGreaterThan(0);
    expect(garmentRoot.position.y).toBeGreaterThan(0);
  });
});
