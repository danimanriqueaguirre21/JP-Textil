/**
 * Modo diagnóstico del escaneo corporal.
 *
 * ACTIVO por defecto en desarrollo. Desactivar con:
 *   NEXT_PUBLIC_BODY_SCAN_DIAGNOSTIC=false
 *
 * En modo diagnóstico: medidas crudas visibles; avatar usa preset visual + 25% medida.
 */
export function isBodyScanDiagnosticMode(): boolean {
  if (process.env.NEXT_PUBLIC_BODY_SCAN_DIAGNOSTIC === "false") return false;
  if (process.env.NEXT_PUBLIC_BODY_SCAN_DIAGNOSTIC === "true") return true;
  if (process.env.NODE_ENV === "test") return false;
  return true;
}
