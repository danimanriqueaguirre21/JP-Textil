Avatar 3D models (virtual fitting)

male.glb / female.glb
  Source: dan283/basemeshes (CC0) — https://github.com/dan283/basemeshes
  En la app se aplica subdivisión de malla en runtime (mesh-subdivide.ts) si el GLB sigue low-poly.

Calidad máxima (recomendado):
  1. Abrir male_basemesh_v002.blend / female_basemesh_v001.blend del repo dan283
  2. Ejecutar tools/blender/export_avatars_subdiv.py (Subdiv APPLY + Shade Smooth + Auto Smooth 40°)
  3. Reemplazar estos .glb (objetivo: decenas de miles de triángulos, sin flat shading)

Ready Player Me:
  NEXT_PUBLIC_AVATAR_MALE_GLB_URL / NEXT_PUBLIC_AVATAR_FEMALE_GLB_URL en frontend/.env.local

Ver docs/04-ui-ux/pipeline-avatar-3d.md
