# Descarga modelos de avatar para el probador 3D (/try-on).
# Uso: desde frontend/  ->  .\scripts\download-avatar-models.ps1

$ErrorActionPreference = "Stop"
$dest = Join-Path $PSScriptRoot "..\public\models\avatars"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

Write-Host "Descargando male.glb (BoQsc, CC0)..."
$maleZip = Join-Path $env:TEMP "male_base_mesh.zip"
curl.exe -fsSL -o $maleZip `
  "https://github.com/BoQsc/Godot-3D-Male-Base-Mesh/releases/download/1.0.2/male_base_mesh.zip"
Expand-Archive -Path $maleZip -DestinationPath (Join-Path $env:TEMP "male_mesh_dl") -Force
Copy-Item (Join-Path $env:TEMP "male_mesh_dl\male_base_mesh.glb") (Join-Path $dest "male.glb") -Force
Write-Host "  OK -> $dest\male.glb"

Write-Host ""
Write-Host "female.glb:"
Write-Host "  No hay un release publico con .glb listo (como el del hombre)."
Write-Host "  El archivo en el repo ya esta convertido (dan283/basemeshes, CC0)."
if (Test-Path (Join-Path $dest "female.glb")) {
  $kb = [math]::Round((Get-Item (Join-Path $dest "female.glb")).Length / 1KB)
  Write-Host "  Presente: female.glb ($kb KB)"
} else {
  Write-Host "  FALTA female.glb — copialo al repo o exportalo una vez desde el .blend de dan283."
}
