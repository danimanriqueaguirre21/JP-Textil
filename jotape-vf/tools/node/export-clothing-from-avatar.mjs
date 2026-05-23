/**
 * Extrae mallas de ropa desde male.glb y female.glb (mismo espacio que cada avatar).
 * Salida:
 *   clothing/tshirt.glb, shorts.glb (hombre)
 *   clothing/tshirt-female.glb, shorts-female.glb (mujer)
 *
 * node tools/node/export-clothing-from-avatar.mjs
 */
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      Promise.resolve(blob.arrayBuffer()).then((ab) => {
        this.result = ab;
        this.onloadend?.({ target: this });
      });
    }
  };
}

const THREE = require("../../frontend/node_modules/three");
const { GLTFLoader } = require("../../frontend/node_modules/three/examples/jsm/loaders/GLTFLoader.js");
const { GLTFExporter } = require("../../frontend/node_modules/three/examples/jsm/exporters/GLTFExporter.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const AVATAR_DIR = join(__dirname, "../../frontend/public/models/avatars");
const OUT_DIR = join(__dirname, "../../frontend/public/models/clothing");

const GARMENTS_MALE = {
  tshirt: {
    yMinRatio: 0.4,
    yMaxRatio: 0.82,
    thickness: 0.009,
    widthScale: 1.12,
    coreHalfWidthFactor: 0.24,
    coreHalfDepthFactor: 0.22,
    color: "#f2f2f2",
  },
  shorts: {
    yMinRatio: 0.02,
    yMaxRatio: 0.51,
    thickness: 0.0045,
    widthScale: 1.1,
    coreHalfWidthFactor: 0.26,
    coreHalfDepthFactor: 0.24,
    color: "#e8e8e8",
  },
};

/** Más ancho en pecho y cadera para el mesh femenino. */
const GARMENTS_FEMALE = {
  tshirt: {
    yMinRatio: 0.44,
    yMaxRatio: 0.88,
    thickness: 0.0025,
    widthScale: 1.14,
    coreHalfWidthFactor: 0.2,
    coreHalfDepthFactor: 0.22,
    color: "#f2f2f2",
  },
  shorts: {
    yMinRatio: 0.02,
    yMaxRatio: 0.52,
    thickness: 0.0025,
    widthScale: 1.16,
    coreHalfWidthFactor: 0.28,
    coreHalfDepthFactor: 0.24,
    color: "#e8e8e8",
  },
};

const AVATARS = [
  {
    glb: join(AVATAR_DIR, "male.glb"),
    suffix: "",
    garments: GARMENTS_MALE,
    label: "male",
  },
  {
    glb: join(AVATAR_DIR, "female.glb"),
    suffix: "-female",
    garments: GARMENTS_FEMALE,
    label: "female",
  },
];

function findBodyMesh(root) {
  let best = null;
  let bestCount = 0;
  root.traverse((node) => {
    if (!node.isMesh) return;
    const count = node.geometry?.attributes?.position?.count ?? 0;
    if (count > bestCount) {
      bestCount = count;
      best = node;
    }
  });
  return best;
}

function getRegionBounds(geometry, region) {
  const pos = geometry.attributes.position;
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    box.expandByPoint(v);
  }
  const height = box.max.y - box.min.y;
  const yMin = box.min.y + height * region.yMinRatio;
  const yMax = box.min.y + height * region.yMaxRatio;
  let sliceMinX = Infinity;
  let sliceMaxX = -Infinity;
  let sliceMinZ = Infinity;
  let sliceMaxZ = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    if (v.y < yMin || v.y > yMax) continue;
    sliceMinX = Math.min(sliceMinX, v.x);
    sliceMaxX = Math.max(sliceMaxX, v.x);
    sliceMinZ = Math.min(sliceMinZ, v.z);
    sliceMaxZ = Math.max(sliceMaxZ, v.z);
  }
  const spanX = Number.isFinite(sliceMinX) ? sliceMaxX - sliceMinX : box.max.x - box.min.x;
  const spanZ = Number.isFinite(sliceMinZ) ? sliceMaxZ - sliceMinZ : box.max.z - box.min.z;
  return {
    yMin,
    yMax,
    centerX: (box.min.x + box.max.x) / 2,
    centerZ: (box.min.z + box.max.z) / 2,
    halfWidthX: spanX * region.coreHalfWidthFactor,
    halfWidthZ: Math.max(spanZ * region.coreHalfDepthFactor, spanX * 0.1),
  };
}

function buildGarmentGeometry(source, region) {
  const src = source.index ? source : source.clone();
  const posAttr = src.getAttribute("position");
  const normAttr =
    src.getAttribute("normal") ||
    (src.computeVertexNormals(), src.getAttribute("normal"));
  const bounds = getRegionBounds(src, region);
  const positions = [];
  const indices = [];
  const vertexBySource = new Map();
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  const out = new THREE.Vector3();
  const tri = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const maxDx = bounds.halfWidthX * 1.15;
  const maxDz = bounds.halfWidthZ * 1.15;

  const vertexIndex = (sourceIdx) => {
    const cached = vertexBySource.get(sourceIdx);
    if (cached !== undefined) return cached;
    v.fromBufferAttribute(posAttr, sourceIdx);
    n.fromBufferAttribute(normAttr, sourceIdx);
    out.copy(v);
    out.x = bounds.centerX + (out.x - bounds.centerX) * region.widthScale;
    out.z = bounds.centerZ + (out.z - bounds.centerZ) * region.widthScale;
    out.addScaledVector(n, region.thickness);
    const idx = positions.length / 3;
    positions.push(out.x, out.y, out.z);
    vertexBySource.set(sourceIdx, idx);
    return idx;
  };

  const addTriangle = (ia, ib, ic) => {
    tri[0].fromBufferAttribute(posAttr, ia);
    tri[1].fromBufferAttribute(posAttr, ib);
    tri[2].fromBufferAttribute(posAttr, ic);
    const cy = (tri[0].y + tri[1].y + tri[2].y) / 3;
    if (cy < bounds.yMin || cy > bounds.yMax) return;
    const cx = (tri[0].x + tri[1].x + tri[2].x) / 3;
    const cz = (tri[0].z + tri[1].z + tri[2].z) / 3;
    if (Math.abs(cx - bounds.centerX) > maxDx) return;
    if (Math.abs(cz - bounds.centerZ) > maxDz) return;
    indices.push(vertexIndex(ia), vertexIndex(ib), vertexIndex(ic));
  };

  if (src.index) {
    const index = src.index;
    for (let i = 0; i < index.count; i += 3) {
      addTriangle(index.getX(i), index.getX(i + 1), index.getX(i + 2));
    }
  } else {
    for (let i = 0; i < posAttr.count; i += 3) {
      addTriangle(i, i + 1, i + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function loadGlb(path) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const buffer = readFileSync(path);
    loader.parse(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      path,
      resolve,
      reject,
    );
  });
}

async function exportGarment(_gltf, body, fileName, region) {
  const geo = buildGarmentGeometry(body.geometry, region);
  if (geo.attributes.position.count < 24) {
    throw new Error(`${fileName}: not enough vertices (real mesh slice failed)`);
  }

  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: region.color,
      roughness: 0.82,
      metalness: 0.02,
    }),
  );
  mesh.name = `${fileName}_mesh`;

  const root = new THREE.Group();
  root.name = fileName;
  root.add(mesh);

  const exporter = new GLTFExporter();
  const buffer = await new Promise((resolve, reject) => {
    exporter.parse(
      root,
      (result) => {
        if (result instanceof ArrayBuffer) resolve(result);
        else reject(new Error("Expected binary GLB"));
      },
      reject,
      { binary: true },
    );
  });

  const outPath = join(OUT_DIR, `${fileName}.glb`);
  writeFileSync(outPath, Buffer.from(buffer));
  console.log(
    `✅ ${outPath} (${buffer.byteLength} bytes, ${geo.attributes.position.count} verts)`,
  );
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  for (const avatar of AVATARS) {
    const gltf = await loadGlb(avatar.glb);
    const body = findBodyMesh(gltf.scene);
    if (!body) throw new Error(`No body mesh in ${avatar.label}.glb`);

    for (const [name, region] of Object.entries(avatar.garments)) {
      await exportGarment(gltf, body, `${name}${avatar.suffix}`, region);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
