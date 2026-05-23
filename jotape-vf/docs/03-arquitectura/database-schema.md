# Base de datos PostgreSQL — JotaPe VF (español)

Esquema **100 % en español**: tablas, columnas, FK, índices y modelos SQLAlchemy alineados.

## Fuente de verdad

| Artefacto | Ruta |
|-----------|------|
| Modelos ORM | `backend/src/shared/db/modelos/` |
| Migración Alembic | `backend/alembic/versions/20260521_0001_esquema_inicial_jotape_vf.py` |
| SQL de referencia | `infra/scripts/schema-jotape-vf.sql` (generado desde ORM) |
| Semillas | `infra/scripts/seed-jotape-vf.sql` |

## Orden de ejecución

```bash
# Opción A — Alembic (recomendado)
cd backend
alembic upgrade head

# Opción B — SQL directo
psql -d jotape_vf -f ../infra/scripts/schema-jotape-vf.sql
psql -d jotape_vf -f ../infra/scripts/seed-jotape-vf.sql
```

## Diagrama de relaciones

```
roles ──► usuarios ──┬── direcciones_usuario
                     ├── medidas_usuario
                     ├── recomendaciones_talla ──► tallas
                     ├── avatares_usuario
                     ├── sesiones_probador ──► prendas_3d, variantes_producto
                     ├── carrito ──► carrito_detalle ──► variantes_producto
                     ├── pedidos ──┬── pedido_detalle, pagos, envios
                     │              └── historial_estados_pedido ──► estados_pedido
                     └── pedidos_personalizados ──► disenos_personalizados ──► archivos_diseno

categorias ──► productos ──┬── imagenes_producto
                           ├── variantes_producto (tallas, colores)
                           ├── medidas_prenda
                           └── prendas_3d
```

## 28 tablas

`roles`, `usuarios`, `direcciones_usuario`, `categorias`, `productos`, `imagenes_producto`, `tallas`, `colores`, `variantes_producto`, `medidas_prenda`, `estados_pedido`, `carrito`, `carrito_detalle`, `pedidos`, `pedido_detalle`, `pagos`, `envios`, `historial_estados_pedido`, `medidas_usuario`, `recomendaciones_talla`, `prendas_3d`, `avatares_usuario`, `sesiones_probador`, `estados_personalizacion`, `pedidos_personalizados`, `disenos_personalizados`, `archivos_diseno`, `historial_estados_personalizacion`

## Convenciones

- PK: `UUID` con `gen_random_uuid()`
- Auditoría: `creado_en`, `actualizado_en` + trigger `establecer_actualizado_en()`
- Dinero: `NUMERIC(12,2)`
- Archivos: solo `url_*` / `url` (sin binarios)
- JSON: `metadatos`, `entrada`, `salida`, `direccion_envio`

## API auth (campos JSON en español)

Registro: `email`, `contrasena`, `nombre_completo`  
Login: `email`, `contrasena`  
Respuesta usuario: `creado_en`, `activo`, `nombre_completo`

Rutas HTTP se mantienen (`/auth`, `/users`) por compatibilidad; el modelo de datos es español.

## Normalización

- Variante = producto + talla + color (única por combinación)
- Snapshots en `pedido_detalle` y direcciones JSON al confirmar
- Catálogos `estados_*`, `tallas`, `colores` en tablas separadas
- Una medida corporal `es_actual` por usuario (lógica en aplicación)
