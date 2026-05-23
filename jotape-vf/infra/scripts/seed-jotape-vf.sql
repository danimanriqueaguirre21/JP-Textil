-- Semillas JotaPe VF (ejecutar después del esquema)
-- Columnas en español — sincronizado con SQLAlchemy

BEGIN;

INSERT INTO roles (id, codigo, nombre, descripcion, activo) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'admin',   'Administrador', 'Acceso total al panel', TRUE),
  ('a0000000-0000-4000-8000-000000000002', 'cliente', 'Cliente',       'Compras y probador virtual', TRUE),
  ('a0000000-0000-4000-8000-000000000003', 'operador','Operador',      'Gestión de pedidos y personalización', TRUE)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tallas (id, codigo, nombre, orden) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'XS',  'Extra Small', 1),
  ('b0000000-0000-4000-8000-000000000002', 'S',   'Small',       2),
  ('b0000000-0000-4000-8000-000000000003', 'M',   'Medium',      3),
  ('b0000000-0000-4000-8000-000000000004', 'L',   'Large',       4),
  ('b0000000-0000-4000-8000-000000000005', 'XL',  'Extra Large', 5),
  ('b0000000-0000-4000-8000-000000000006', 'XXL', '2X Large',    6)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO colores (id, codigo, nombre, hex) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'negro',  'Negro',  '#000000'),
  ('c0000000-0000-4000-8000-000000000002', 'blanco', 'Blanco', '#FFFFFF'),
  ('c0000000-0000-4000-8000-000000000003', 'gris',   'Gris',   '#6B7280')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO categorias (id, slug, nombre, descripcion, orden) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'oversize',   'Oversize',   'Poleras oversize', 1),
  ('d0000000-0000-4000-8000-000000000002', 'buzo-baggy', 'Buzos Baggy','Buzos baggy', 2),
  ('d0000000-0000-4000-8000-000000000003', 'hoodie',     'Hoodies',    'Hoodies', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO estados_pedido (id, codigo, nombre, orden, es_final) VALUES
  ('e0000000-0000-4000-8000-000000000001', 'pendiente', 'Pendiente', 1, FALSE),
  ('e0000000-0000-4000-8000-000000000002', 'pagado',    'Pagado',    2, FALSE),
  ('e0000000-0000-4000-8000-000000000003', 'enviado',   'Enviado',   3, FALSE),
  ('e0000000-0000-4000-8000-000000000004', 'entregado', 'Entregado', 4, TRUE)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO estados_personalizacion (id, codigo, nombre, orden, es_final) VALUES
  ('f0000000-0000-4000-8000-000000000001', 'recibido',   'Recibido',   1, FALSE),
  ('f0000000-0000-4000-8000-000000000002', 'en_diseno',  'En diseño',  2, FALSE),
  ('f0000000-0000-4000-8000-000000000003', 'entregado',  'Entregado',  6, TRUE)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO productos (id, categoria_id, slug, nombre, descripcion_corta, precio_base, genero_objetivo, destacado) VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    'd0000000-0000-4000-8000-000000000001',
    'polera-oversize-negra',
    'Polera Oversize Negra',
    'Algodón pesado',
    135.00,
    'unisex',
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO variantes_producto (id, producto_id, talla_id, color_id, sku, precio, existencias) VALUES
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000003',
    'c0000000-0000-4000-8000-000000000001',
    'JP-OVN-BLK-M',
    135.00,
    25
  )
ON CONFLICT (sku) DO NOTHING;

INSERT INTO prendas_3d (id, producto_id, codigo, nombre, tipo_prenda, genero, url_glb) VALUES
  (
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'tshirt-male',
    'T-Shirt Male',
    'tshirt',
    'male',
    '/models/clothing/tshirt.glb'
  )
ON CONFLICT (codigo) DO NOTHING;

COMMIT;
