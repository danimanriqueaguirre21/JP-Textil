import { ExtrudeGeometry, Shape, type BufferGeometry } from "three";
import { toCreasedNormals } from "three-stdlib";

const EPS = 0.00001;

/** Caja con bordes redondeados (Y = alto, X = ancho, Z = profundidad). */
export function createRoundedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  radius = 0.06,
): BufferGeometry {
  const r = Math.min(radius, width / 2 - EPS, height / 2 - EPS, depth / 2 - EPS);
  const shape = new Shape();
  shape.absarc(EPS, EPS, EPS, -Math.PI / 2, -Math.PI, true);
  shape.absarc(EPS, height - r * 2, EPS, Math.PI, Math.PI / 2, true);
  shape.absarc(width - r * 2, height - r * 2, EPS, Math.PI / 2, 0, true);
  shape.absarc(width - r * 2, EPS, EPS, 0, -Math.PI / 2, true);

  const geo = new ExtrudeGeometry(shape, {
    depth: depth - r * 2,
    bevelEnabled: true,
    bevelSegments: 6,
    bevelSize: r - EPS,
    bevelThickness: r,
    curveSegments: 4,
  });
  geo.center();
  toCreasedNormals(geo, 0.4);
  geo.computeVertexNormals();
  return geo;
}
