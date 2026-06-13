import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const glbPath = path.join(__dirname, "../public/models/avatars/male.glb");
const buf = fs.readFileSync(glbPath);
const jsonChunk = parseGlbJson(buf);
const meshes = jsonChunk.meshes ?? [];
const nodes = jsonChunk.nodes ?? [];
console.log("file:", glbPath, "size MB:", (buf.length / 1024 / 1024).toFixed(2));
for (const mesh of meshes) {
  const targets = mesh.extras?.targetNames ?? mesh.weights?.map((_, i) => `weight_${i}`);
  const prim = mesh.primitives?.[0];
  const morphCount = prim?.targets?.length ?? 0;
  console.log("mesh:", mesh.name ?? "(unnamed)", "morphTargets:", morphCount);
  if (mesh.extras?.targetNames) {
    console.log("  names:", mesh.extras.targetNames.slice(0, 30));
  }
}
const names = JSON.stringify(jsonChunk).match(/"name":"[^"]+"/g) ?? [];
const body = names.filter((n) =>
  /belly|chest|waist|hip|arm|leg|neck|abdomen|stomach|fat|bulk|muscle|shape|morph|body/i.test(n),
);
console.log("interesting names:", [...new Set(body)].slice(0, 50));

function parseGlbJson(buffer) {
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546c67) throw new Error("not glb");
  const jsonLen = buffer.readUInt32LE(12);
  const jsonStart = 20;
  return JSON.parse(buffer.toString("utf8", jsonStart, jsonStart + jsonLen));
}
