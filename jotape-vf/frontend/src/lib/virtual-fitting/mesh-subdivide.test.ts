import { BufferAttribute, BufferGeometry } from "three";

import {
  countGeometryTriangles,
  subdivideBufferGeometry,
} from "./mesh-subdivide";

function indexedQuad(): BufferGeometry {
  const geo = new BufferGeometry();
  geo.setAttribute(
    "position",
    new BufferAttribute(
      new Float32Array([
        0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0,
      ]),
      3,
    ),
  );
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  return geo;
}

describe("mesh-subdivide", () => {
  it("increases triangle count", () => {
    const base = indexedQuad();
    const before = countGeometryTriangles(base);
    const refined = subdivideBufferGeometry(base, { levels: 1 });
    const after = countGeometryTriangles(refined);
    expect(after).toBeGreaterThan(before);
  });
});
