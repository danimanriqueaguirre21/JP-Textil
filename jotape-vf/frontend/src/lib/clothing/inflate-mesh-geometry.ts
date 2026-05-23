import { BufferAttribute, BufferGeometry, Vector3 } from "three";

const _normal = new Vector3();
const _vertex = new Vector3();

/** Empuja vértices a lo largo de la normal (holgura sobre el cuerpo, sin cajas procedurales). */
export function inflateMeshGeometry(
  geometry: BufferGeometry,
  amount: number,
): void {
  if (amount <= 0) return;

  const position = geometry.getAttribute("position") as BufferAttribute | null;
  if (!position) return;

  geometry.computeVertexNormals();
  const normal = geometry.getAttribute("normal") as BufferAttribute | null;
  if (!normal) return;

  for (let i = 0; i < position.count; i++) {
    _vertex.fromBufferAttribute(position, i);
    _normal.fromBufferAttribute(normal, i);
    _vertex.addScaledVector(_normal, amount);
    position.setXYZ(i, _vertex.x, _vertex.y, _vertex.z);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
}
