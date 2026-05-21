# JotaPe VF — Modelos (ML)

- **datasets/**: datasets locales (no commitear CSV/XLSX grandes).
- **notebooks/**: EDA y entrenamiento.
- **serialized/**: modelos `.joblib` / `.pkl` versionados (ligeros; considerar Git LFS si crecen).
- **training/**: scripts reproducibles de entrenamiento.

Integración con el backend vía `backend/src/ml/` que carga artefactos desde esta carpeta en runtime (montaje Docker o variable de entorno).
