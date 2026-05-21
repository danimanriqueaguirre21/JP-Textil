import {

  DataTexture,

  DoubleSide,

  MeshPhysicalMaterial,

  MeshStandardMaterial,

  RepeatWrapping,

  RGBAFormat,

  UnsignedByteType,

  type Mesh,

  type Material,

  type Texture,

  Vector2,

} from "three";



let skinNormalMap: Texture | null = null;

let fabricNormalMap: Texture | null = null;



function makeTileNormalMap(): Texture {

  const size = 64;

  const data = new Uint8Array(size * size * 4);

  for (let i = 0; i < size * size; i++) {

    const n = (Math.random() - 0.5) * 18;

    const o = i * 4;

    data[o] = 128 + n;

    data[o + 1] = 128 + n;

    data[o + 2] = 255;

    data[o + 3] = 255;

  }

  const tex = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);

  tex.wrapS = RepeatWrapping;

  tex.wrapT = RepeatWrapping;

  tex.repeat.set(8, 8);

  tex.needsUpdate = true;

  return tex;

}



export function getSkinNormalMap(): Texture {

  if (!skinNormalMap) skinNormalMap = makeTileNormalMap();

  return skinNormalMap;

}



export function getFabricNormalMap(): Texture {

  if (!fabricNormalMap) {

    fabricNormalMap = makeTileNormalMap();

    fabricNormalMap.repeat.set(12, 12);

  }

  return fabricNormalMap;

}



const SKIN_NORMAL = new Vector2(0.14, 0.14);

const FABRIC_NORMAL = new Vector2(0.18, 0.18);



export function createSkinMaterial(): MeshPhysicalMaterial {

  return new MeshPhysicalMaterial({

    color: "#d8c8bc",

    roughness: 0.42,

    metalness: 0.02,

    clearcoat: 0.06,

    clearcoatRoughness: 0.55,

    normalMap: getSkinNormalMap(),

    normalScale: SKIN_NORMAL,

    envMapIntensity: 0.9,

    flatShading: false,

    wireframe: false,

    side: DoubleSide,

  });

}



export function createHairMaterial(): MeshPhysicalMaterial {

  return new MeshPhysicalMaterial({

    color: "#2a2420",

    roughness: 0.82,

    metalness: 0.04,

    envMapIntensity: 0.75,

    flatShading: false,

    wireframe: false,

    side: DoubleSide,

  });

}



/** Tela — MeshStandardMaterial sólido (sin normal map en prenda). */
export function createFabricMaterial(color: string): MeshStandardMaterial {
  const mat = new MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0,
    flatShading: false,
    wireframe: false,
    side: DoubleSide,
  });
  mat.wireframe = false;
  return mat;
}



/** Fuerza materiales sólidos (sin wireframe) en toda la jerarquía. */

export function applySolidMaterialFlags(material: Material): void {
  if ("wireframe" in material) {
    (material as MeshStandardMaterial).wireframe = false;
  }
  material.side = DoubleSide;
  material.needsUpdate = true;
}



export function smoothMeshNormals(mesh: Mesh): void {

  const geo = mesh.geometry;

  if (!geo) return;

  geo.computeVertexNormals();

}


