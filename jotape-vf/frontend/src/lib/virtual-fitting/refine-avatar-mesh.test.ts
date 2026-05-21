import { BufferAttribute, BufferGeometry, Group, Mesh } from "three";

import { countGeometryTriangles } from "./mesh-subdivide";
import { refineAvatarRoot } from "./refine-avatar-mesh";

describe("refine-avatar-mesh", () => {
  it("subdivides body meshes on the avatar root", () => {
    const geo = new BufferGeometry();
    geo.setAttribute(
      "position",
      new BufferAttribute(
        new Float32Array([0, 0, 0, 1, 0, 0, 0.5, 1, 0, 1, 1, 0]),
        3,
      ),
    );
    geo.setIndex([0, 1, 2, 1, 3, 2]);

    const mesh = new Mesh(geo);
    mesh.name = "body";
    const root = new Group();
    root.add(mesh);

    const before = countGeometryTriangles(geo);
    refineAvatarRoot(root);
    const after = countGeometryTriangles(mesh.geometry);

    expect(after).toBeGreaterThan(before);
  });
});
