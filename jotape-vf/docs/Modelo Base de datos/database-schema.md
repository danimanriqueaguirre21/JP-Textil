# Base de datos PostgreSQL — JotaPe VF

Esquema relacional para ecommerce streetwear + probador virtual 3D + IA de tallas + pedidos personalizados.

## Archivos

| Archivo | Propósito |
|---------|-----------|
| `infra/scripts/schema-jotape-vf.sql` | DDL completo (26 tablas) |
| `infra/scripts/seed-jotape-vf.sql` | Datos de ejemplo |

## Orden de ejecución

```bash
# 1. Crear base (si no existe)
createdb jotape_vf

# 2. Esquema
psql -d jotape_vf -f infra/scripts/schema-jotape-vf.sql

# 3. Semillas (opcional)
psql -d jotape_vf -f infra/scripts/seed-jotape-vf.sql
```

Con Docker (desde la raíz del monorepo):

```bash
docker compose -f infra/docker/docker-compose.yml exec -T postgres \
  psql -U postgres -d jotape -f /scripts/schema-jotape-vf.sql
```

> Monta `infra/scripts` en el contenedor o copia los archivos según tu `docker-compose`.

---

## Diagrama de relaciones (textual)

```
roles ─────────────┐
                   │
                   ▼
              usuarios ─────┬──── direcciones_usuario
                   │        │
                   │        ├──── medidas_usuario
                   │        ├──── recomendaciones_talla ──► tallas
                   │        ├──── avatares_usuario
                   │        ├──── sesiones_probador
                   │        ├──── carrito ──► carrito_detalle ──► variantes_producto
                   │        ├──── pedidos ──┬── pedido_detalle ──► variantes_producto
                   │        │               ├── pagos
                   │        │               ├── envios
                   │        │               └── historial_estados_pedido ──► estados_pedido
                   │        │
                   │        └──── pedidos_personalizados ──┬── disenos_personalizados ──► archivos_diseno
                   │                                        └── historial_estados_personalizacion
                   │                                                  └── estados_personalizacion

categorias (self parent_id)
     │
     ▼
productos ──┬── imagenes_producto
            ├── variantes_producto ──┬── tallas
            │                        ├── colores
            │                        └── medidas_prenda
            └── prendas_3d

estados_pedido          (catálogo)
estados_personalizacion (catálogo)
```

---

## Tablas (26)

| # | Tabla | Descripción breve |
|---|--------|-------------------|
| 1 | `roles` | Roles de acceso (admin, cliente, operador). |
| 2 | `usuarios` | Cuentas con email, password hash y rol. |
| 3 | `direcciones_usuario` | Direcciones de envío/facturación. |
| 4 | `categorias` | Categorías jerárquicas del catálogo. |
| 5 | `productos` | Producto base (nombre, precio, categoría). |
| 6 | `imagenes_producto` | URLs de fotos (sin binarios). |
| 7 | `tallas` | Catálogo XS–XXL. |
| 8 | `colores` | Catálogo de colores con hex opcional. |
| 9 | `variantes_producto` | SKU = producto + talla + color + stock. |
| 10 | `medidas_prenda` | Medidas de confección por variante (`fit`, cm). |
| 11 | `estados_pedido` | Estados del pedido estándar. |
| 12 | `carrito` | Carrito por usuario o sesión invitado. |
| 13 | `carrito_detalle` | Líneas del carrito. |
| 14 | `pedidos` | Cabecera de pedido con totales y dirección JSON. |
| 15 | `pedido_detalle` | Líneas con snapshot de precio/SKU. |
| 16 | `pagos` | Pagos y referencias de pasarela. |
| 17 | `envios` | Tracking y estado logístico. |
| 18 | `historial_estados_pedido` | Auditoría de cambios de estado. |
| 19 | `medidas_usuario` | Altura, peso, pecho, cintura, cadera. |
| 20 | `recomendaciones_talla` | Resultado IA: talla, confianza, explicación. |
| 21 | `prendas_3d` | Assets GLB/USDZ por URL. |
| 22 | `avatares_usuario` | Avatar 3D del usuario por URL. |
| 23 | `sesiones_probador` | Sesiones del probador (analytics). |
| 24 | `estados_personalizacion` | Flujo de pedido personalizado. |
| 25 | `pedidos_personalizados` | Solicitud con texto, color, talla, imagen URL. |
| 26 | `disenos_personalizados` | Versiones de diseño. |
| 27 | `archivos_diseno` | Archivos del diseño (solo URL + metadata). |
| 28 | `historial_estados_personalizacion` | Auditoría de personalización. |

> Son **28 entidades** (incluye catálogos de estado e historiales). Cumple y supera el mínimo de 20 tablas.

---

## Decisiones de diseño

### IDs

- **UUID** (`gen_random_uuid()`) en todas las PK para APIs distribuidas y alineación con el backend actual (`users.id` UUID).

### Dinero

- `NUMERIC(12,2)` para precios y totales (evita errores de `float`).

### Imágenes y 3D

- Solo `TEXT` / URL en `imagenes_producto`, `archivos_diseno`, `prendas_3d`, `avatares_usuario`.
- `metadata JSONB` para dimensiones, variantes de archivo, etc.

### Recomendación IA

- `nivel_confianza` entre 0 y 1.
- `explicacion` en texto legible.
- `entrada` / `salida` JSONB para features del modelo futuro.

### Pedidos

- `direccion_envio` y snapshots en JSONB al confirmar (no mutan si el usuario cambia su libreta de direcciones).

### Índices

- FK frecuentes: `usuario_id`, `producto_id`, `pedido_id`, `variante_id`.
- Parciales en `activo = TRUE` donde aplica.

---

## Recomendaciones de normalización

1. **3FN en catálogo**: producto → variante → medidas; no repetir talla/color en cada fila de producto.
2. **Catálogos separados**: `tallas`, `colores`, `estados_*` evitan strings mágicos en columnas transaccionales.
3. **Snapshot en pedido**: `pedido_detalle` guarda nombre/SKU/precio del momento de compra (desnormalización controlada).
4. **Una medida “actual” por usuario**: índice parcial `medidas_usuario.es_actual`; al insertar nueva, desactivar la anterior en aplicación.
5. **JSONB con moderación**: usar solo para metadata, direcciones snapshot y payloads IA; no para datos que requieran JOIN frecuente sin índice GIN.
6. **Migración desde `users` (inglés)**: el backend actual usa tabla `users`; puedes crear una vista `users` → `usuarios` o migrar con Alembic cuando integres el esquema.

---

## Compatibilidad con el backend actual

El módulo auth usa `users` (SQLAlchemy). Para integrar este esquema:

- Opción A: renombrar `usuarios` → `users` en el SQL.
- Opción B: migración Alembic que mapee `UserModel` a `usuarios`.
- Mantener `email`, `hashed_password`, `is_active`, `created_at` ya presentes.

---

## Próximos pasos sugeridos

1. Alembic migrations a partir de este DDL.
2. RLS (Row Level Security) por `usuario_id` en pedidos y medidas.
3. Vistas: `v_variantes_stock`, `v_recomendacion_ultima`.
4. Particionar `historial_*` por año si crece mucho.
