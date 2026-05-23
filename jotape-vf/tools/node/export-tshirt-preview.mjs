/**
 * Genera SOLO tshirt-preview.glb desde male.glb (no sobrescribe tshirt.glb).
 * Uso: npm run export:tshirt:preview
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
const OUT_PATH = join(__dirname, "../../frontend/public/models/clothing/tshirt-preview.glb");

/** Polo manga corta (referencia: cuello bajo, mangas al bíceps, holgado). */
const TSHIRT_REGION = {
  yMinRatio: 0.4,
  yMaxRatio: 0.78,
  yMaxCapRatio: 0.74,
  thickness: 0.013,
  radialPush: 0.011,
  widthScale: 1.16,
  coreHalfWidthFactor: 0.44,
  coreHalfDepthFactor: 0.58,
  sleeveBandMin: 0.32,
  sleeveBandMax: 0.68,
  shoulderBandMin: 0.62,
  /** Mangas cortas: solo triángulos del brazo entre estos ratios de altura del cuerpo. */
  sleeveArmYMinRatio: 0.54,
  sleeveArmYMaxRatio: 0.7,
  color: "#f2f2f2",
};

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
  let yMax = box.min.y + height * region.yMaxRatio;
  if (region.yMaxCapRatio != null) {
    yMax = Math.min(yMax, box.min.y + height * region.yMaxCapRatio);
  }
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
  const bandH = Math.max(bounds.yMax - bounds.yMin, 1e-6);
  const radial = new THREE.Vector3();
  const posAttrBox = src.getAttribute("position");
  const fullBox = new THREE.Box3();
  for (let i = 0; i < posAttrBox.count; i++) {
    v.fromBufferAttribute(posAttrBox, i);
    fullBox.expandByPoint(v);
  }
  const bodyH = fullBox.max.y - fullBox.min.y;
  const sleeveArmY0 =
    fullBox.min.y + bodyH * (region.sleeveArmYMinRatio ?? 0.54);
  const sleeveArmY1 =
    fullBox.min.y + bodyH * (region.sleeveArmYMaxRatio ?? 0.7);
  const torsoDx = bounds.halfWidthX * 1.08;

  function cutLimits(cy) {
    const t = (cy - bounds.yMin) / bandH;
    let xMul = 1.05;
    let zMul = 1.12;
    if (t >= region.sleeveBandMin && t <= region.sleeveBandMax) {
      xMul = 1.55;
      zMul = 1.2;
    } else if (t >= region.shoulderBandMin) {
      xMul = 1.22;
      zMul = 1.22;
    }
    return {
      maxDx: bounds.halfWidthX * xMul,
      maxDz: bounds.halfWidthZ * zMul,
    };
  }

  const vertexIndex = (sourceIdx) => {
    const cached = vertexBySource.get(sourceIdx);
    if (cached !== undefined) return cached;
    v.fromBufferAttribute(posAttr, sourceIdx);
    n.fromBufferAttribute(normAttr, sourceIdx);
    out.copy(v);
    out.x = bounds.centerX + (out.x - bounds.centerX) * region.widthScale;
    out.z = bounds.centerZ + (out.z - bounds.centerZ) * region.widthScale;

    radial.set(out.x - bounds.centerX, 0, out.z - bounds.centerZ);
    const radialLen = radial.length();
    if (radialLen > 1e-6) {
      radial.divideScalar(radialLen);
      if (region.radialPush > 0) out.addScaledVector(radial, region.radialPush);
    }

    let normalAmt = region.thickness;
    if (radialLen > 1e-6 && n.dot(radial) < 0) normalAmt *= -1;
    out.addScaledVector(n, normalAmt);

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
    const armSpan = Math.abs(cx - bounds.centerX);
    const { maxDx, maxDz } = cutLimits(cy);

    if (armSpan > torsoDx) {
      if (cy < sleeveArmY0 || cy > sleeveArmY1) return;
      if (armSpan > maxDx) return;
    } else {
      if (cy > sleeveArmY1 && armSpan > torsoDx * 1.05) return;
      if (armSpan > maxDx) return;
    }
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

async function main() {
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  const gltf = await loadGlb(MALE_GLB);
  const body = findBodyMesh(gltf.scene);
  if (!body) throw new Error("No body mesh in male.glb");

  const geo = buildGarmentGeometry(body.geometry, TSHIRT_REGION);
  if (geo.attributes.position.count < 24) {
    throw new Error("Preview tshirt: not enough vertices");
  }

  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: TSHIRT_REGION.color,
      roughness: 0.82,
      metalness: 0.02,
    }),
  );
  mesh.name = "tshirt_preview_mesh";

  const root = new THREE.Group();
  root.name = "tshirt_preview";
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

  writeFileSync(OUT_PATH, Buffer.from(buffer));
  console.log(
    `✅ Preview: ${OUT_PATH} (${buffer.byteLength} bytes, ${geo.attributes.position.count} verts)`,
  );
  console.log("   Aprueba en Blender o en /try-on con tshirt-preview.glb");
  console.log("   Si OK: copia a tshirt.glb o npm run export:clothing:mesh");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
