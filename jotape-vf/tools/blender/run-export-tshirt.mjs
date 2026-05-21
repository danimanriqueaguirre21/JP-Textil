/**
 * Lanza Blender en background para exportar tshirt.glb (Windows-safe, rutas con espacios).
 */
import { spawn } from "child_process";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..", "..");
const scriptPath = join(__dirname, "export_tshirt_glb.py");

const DEFAULT_BLENDER_WIN =
  "C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe";

function resolveBlender() {
  if (process.env.BLENDER_EXE && existsSync(process.env.BLENDER_EXE)) {
    return process.env.BLENDER_EXE;
  }
  if (process.platform === "win32" && existsSync(DEFAULT_BLENDER_WIN)) {
    return DEFAULT_BLENDER_WIN;
  }
  return "blender";
}

const blender = resolveBlender();
const args = ["--background", "--python", scriptPath];

console.log(`Running: ${blender} ${args.join(" ")}`);

const child = spawn(blender, args, {
  cwd: projectRoot,
  stdio: "inherit",
  shell: false,
});

child.on("error", (err) => {
  console.error(err.message);
  console.error(
    "Define BLENDER_EXE con la ruta completa a blender.exe si no está en PATH.",
  );
  process.exit(1);
});

child.on("close", (code) => {
  process.exit(code ?? 1);
});
