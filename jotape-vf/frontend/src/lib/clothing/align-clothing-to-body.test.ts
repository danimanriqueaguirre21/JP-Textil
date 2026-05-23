import { BufferAttribute, BufferGeometry, Group, Mesh } from "three";

import { clothingOffsets } from "./clothing-offsets";
import {
  alignGarmentToBodyMesh,
  isSameSpaceGarment,
} from "./align-clothing-to-body";

function bodyBoxGeometry(): BufferGeometry {
  const geo = new BufferGeometry();
  const positions = new Float32Array([
    -0.25, 0, -0.12,
    0.25, 0, 0.12,
    -0.25, 1.75, -0.12,
    0.25, 1.75, 0.12,
    -0.15, 0.9, -0.08,
    0.15, 0.9, 0.08,
    -0.15, 1.2, -0.08,
    0.15, 1.2, 0.08,
  ]);
  geo.setAttribute("position", new BufferAttribute(positions, 3));
  geo.computeBoundingBox();
  return geo;
}

describe("align-clothing-to-body", () => {
  it("exposes configurable clothingOffsets", () => {
    expect(clothingOffsets.male.tshirt.position).toHaveLength(3);
    expect(clothingOffsets.female.shorts.scale).toHaveLength(3);
  });

  it("aligns garment scale and position on body mesh", () => {
    const body = new Mesh(bodyBoxGeometry());
    body.name = "basemesh";

    const garment = new Group();
    const mesh = new Mesh(
      new BufferGeometry().setAttribute(
        "position",
        new BufferAttribute(
          new Float32Array([
            -0.1, -0.1, -0.05, 0.1, -0.1, 0.05, -0.1, 0.1, -0.05, 0.1, 0.1, 0.05,
          ]),
          3,
        ),
      ),
    );
    garment.add(mesh);

    expect(isSameSpaceGarment(garment)).toBe(false);
    alignGarmentToBodyMesh(garment, body, "male", "tshirt", 1);

    expect(garment.scale.x).toBeGreaterThan(0);
    expect(garment.position.y).toBeGreaterThan(0.3);
  });
});
