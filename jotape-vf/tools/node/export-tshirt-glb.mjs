/**
 * Genera tshirt.glb REAL desde male.glb (malla del torso extraída del basemesh).
 * Ejecutar: node tools/node/export-tshirt-glb.mjs
 * (usa three desde frontend/node_modules)
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
const MALE_GLB = join(__dirname, "../../frontend/public/models/avatars/male.glb");
const OUT_DIR = join(__dirname, "../../frontend/public/models/garments");
const OUT_GLB = join(OUT_DIR, "tshirt.glb");

const REGION = { yMinRatio: 0.48, yMaxRatio: 0.86, thickness: 0.005 };
const WIDTH_SCALE = 1.04;

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

function getTorsoBounds(geometry) {
  const pos = geometry.attributes.position;
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    box.expandByPoint(v);
  }
  const height = box.max.y - box.min.y;
  const yMin = box.min.y + height * REGION.yMinRatio;
  const yMax = box.min.y + height * REGION.yMaxRatio;
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
    halfWidthX: spanX * 0.22,
    halfWidthZ: Math.max(spanZ * 0.2, spanX * 0.12),
  };
}

function buildShirtGeometry(source) {
  const src = source.index ? source : source.clone();
  const posAttr = src.getAttribute("position");
  const normAttr = src.getAttribute("normal") || (src.computeVertexNormals(), src.getAttribute("normal"));
  const bounds = getTorsoBounds(src);
  const positions = [];
  const indices = [];
  const vertexBySource = new Map();
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  const out = new THREE.Vector3();
  const tri = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const maxDx = bounds.halfWidthX * 1.1;
  const maxDz = bounds.halfWidthZ * 1.1;

  const vertexIndex = (sourceIdx) => {
    const cached = vertexBySource.get(sourceIdx);
    if (cached !== undefined) return cached;
    v.fromBufferAttribute(posAttr, sourceIdx);
    n.fromBufferAttribute(normAttr, sourceIdx);
    out.copy(v);
    out.x = bounds.centerX + (out.x - bounds.centerX) * WIDTH_SCALE;
    out.z = bounds.centerZ + (out.z - bounds.centerZ) * WIDTH_SCALE;
    out.addScaledVector(n, REGION.thickness);
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
    loader.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), path, resolve, reject);
  });
}

async function main() {
  const gltf = await loadGlb(MALE_GLB);
  const body = findBodyMesh(gltf.scene);
  if (!body) throw new Error("No body mesh in male.glb");

  const shirtGeo = buildShirtGeometry(body.geometry);
  const shirtMesh = new THREE.Mesh(shirtGeo, new THREE.MeshStandardMaterial({ color: "#111111" }));
  shirtMesh.name = "tshirt_mesh";

  const root = new THREE.Group();
  root.name = "tshirt_garment";
  root.add(shirtMesh);

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

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_GLB, Buffer.from(buffer));
  console.log("Exported", OUT_GLB, `(${buffer.byteLength} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
