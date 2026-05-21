import { BufferAttribute, BufferGeometry, Group, Mesh } from "three";

import { findMainBodyMesh, getTorsoBounds } from "./body-mesh";

function boxGeometry(minY: number, maxY: number): BufferGeometry {
  const geo = new BufferGeometry();
  const positions = new Float32Array([
    0, minY, 0,
    1, minY, 0,
    0, maxY, 0,
    1, maxY, 0,
  ]);
  geo.setAttribute("position", new BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

describe("body-mesh", () => {
  it("picks the largest visible body mesh, not the garment node", () => {
    const body = new Mesh(boxGeometry(0, 2));
    body.name = "male_basemesh";

    const garment = new Mesh(boxGeometry(0, 2));
    garment.name = "tshirt_mesh";
    body.add(garment);

    const root = new Group();
    root.add(body);

    expect(findMainBodyMesh(root)?.name).toBe("male_basemesh");
  });

  it("computes torso Y bounds from geometry height", () => {
    const geo = boxGeometry(0, 2);
    const bounds = getTorsoBounds(geo, "female");

    expect(bounds.yMin).toBeCloseTo(1, 4);
    expect(bounds.yMax).toBeCloseTo(1.52, 4);
    expect(bounds.halfWidthX).toBeGreaterThan(0);
    expect(bounds.halfWidthZ).toBeGreaterThan(0);
  });
});
