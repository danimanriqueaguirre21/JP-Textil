import { Group, Mesh, Object3D } from "three";

import { prepareClothingScene } from "./prepare-clothing-scene";

function mockGltf(): { scene: Object3D } {
  const scene = new Group();
  const mesh = new Mesh();
  mesh.name = "tshirt_mesh";
  scene.add(mesh);
  return { scene };
}

describe("prepareClothingScene", () => {
  it("returns empty group when gltf is undefined", () => {
    const root = prepareClothingScene(undefined);
    expect(root.children.length).toBe(0);
  });

  it("clones meshes from gltf scene without scene.clone()", () => {
    const root = prepareClothingScene(mockGltf(), "#fff");
    expect(root.children.length).toBe(1);
    expect(root.children[0]).toBeInstanceOf(Mesh);
  });
});
