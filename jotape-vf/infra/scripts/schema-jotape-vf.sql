-- JotaPe VF - Esquema PostgreSQL (español, sincronizado con SQLAlchemy)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION establecer_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TABLE categorias (
	id UUID NOT NULL, 
	categoria_padre_id UUID, 
	slug VARCHAR(120) NOT NULL, 
	nombre VARCHAR(200) NOT NULL, 
	descripcion TEXT, 
	imagen_url TEXT, 
	orden INTEGER NOT NULL, 
	activo BOOLEAN NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(categoria_padre_id) REFERENCES categorias (id) ON DELETE SET NULL, 
	UNIQUE (slug)
)

;


CREATE TABLE colores (
	id UUID NOT NULL, 
	codigo VARCHAR(40) NOT NULL, 
	nombre VARCHAR(80) NOT NULL, 
	hex VARCHAR(7), 
	activo BOOLEAN NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (codigo)
)

;


CREATE TABLE estados_pedido (
	id UUID NOT NULL, 
	codigo VARCHAR(40) NOT NULL, 
	nombre VARCHAR(100) NOT NULL, 
	descripcion TEXT, 
	orden INTEGER NOT NULL, 
	es_final BOOLEAN NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (codigo)
)

;


CREATE TABLE estados_personalizacion (
	id UUID NOT NULL, 
	codigo VARCHAR(40) NOT NULL, 
	nombre VARCHAR(100) NOT NULL, 
	descripcion TEXT, 
	orden INTEGER NOT NULL, 
	es_final BOOLEAN NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (codigo)
)

;


CREATE TABLE roles (
	id UUID NOT NULL, 
	codigo VARCHAR(50) NOT NULL, 
	nombre VARCHAR(100) NOT NULL, 
	descripcion TEXT, 
	activo BOOLEAN NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (codigo)
)

;


CREATE TABLE tallas (
	id UUID NOT NULL, 
	codigo VARCHAR(10) NOT NULL, 
	nombre VARCHAR(40) NOT NULL, 
	orden INTEGER NOT NULL, 
	activo BOOLEAN NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (codigo)
)

;


CREATE TABLE productos (
	id UUID NOT NULL, 
	categoria_id UUID NOT NULL, 
	slug VARCHAR(160) NOT NULL, 
	nombre VARCHAR(255) NOT NULL, 
	descripcion TEXT, 
	descripcion_corta VARCHAR(500), 
	precio_base NUMERIC(12, 2) NOT NULL, 
	moneda VARCHAR(3) NOT NULL, 
	genero_objetivo VARCHAR(20), 
	activo BOOLEAN NOT NULL, 
	destacado BOOLEAN NOT NULL, 
	metadatos JSONB NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_productos_categoria_id FOREIGN KEY(categoria_id) REFERENCES categorias (id)
)

;


CREATE TABLE usuarios (
	id UUID NOT NULL, 
	rol_id UUID NOT NULL, 
	email VARCHAR(320) NOT NULL, 
	contrasena_hash VARCHAR(255) NOT NULL, 
	nombre_completo VARCHAR(200), 
	telefono VARCHAR(30), 
	avatar_url TEXT, 
	activo BOOLEAN NOT NULL, 
	email_verificado BOOLEAN NOT NULL, 
	ultimo_acceso_en TIMESTAMP WITH TIME ZONE, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_usuarios_rol_id FOREIGN KEY(rol_id) REFERENCES roles (id)
)

;


CREATE TABLE avatares_usuario (
	id UUID NOT NULL, 
	usuario_id UUID NOT NULL, 
	nombre VARCHAR(100) NOT NULL, 
	genero VARCHAR(20) NOT NULL, 
	url_modelo_glb TEXT NOT NULL, 
	url_usdz TEXT, 
	altura_cm NUMERIC(5, 2), 
	escala NUMERIC(6, 4) NOT NULL, 
	es_predeterminado BOOLEAN NOT NULL, 
	metadatos JSONB NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_avatares_usuario_id FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
)

;


CREATE TABLE carrito (
	id UUID NOT NULL, 
	usuario_id UUID, 
	token_sesion VARCHAR(128), 
	moneda VARCHAR(3) NOT NULL, 
	expira_en TIMESTAMP WITH TIME ZONE, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_carrito_usuario_id FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE, 
	UNIQUE (token_sesion)
)

;


CREATE TABLE direcciones_usuario (
	id UUID NOT NULL, 
	usuario_id UUID NOT NULL, 
	etiqueta VARCHAR(80), 
	destinatario VARCHAR(200) NOT NULL, 
	linea_1 VARCHAR(255) NOT NULL, 
	linea_2 VARCHAR(255), 
	ciudad VARCHAR(120) NOT NULL, 
	provincia VARCHAR(120), 
	codigo_postal VARCHAR(20), 
	pais VARCHAR(2) NOT NULL, 
	telefono VARCHAR(30), 
	es_predeterminada BOOLEAN NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_direcciones_usuario_id FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
)

;


CREATE TABLE imagenes_producto (
	id UUID NOT NULL, 
	producto_id UUID NOT NULL, 
	url TEXT NOT NULL, 
	texto_alt VARCHAR(255), 
	orden INTEGER NOT NULL, 
	es_principal BOOLEAN NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_imagenes_producto_id FOREIGN KEY(producto_id) REFERENCES productos (id) ON DELETE CASCADE
)

;


CREATE TABLE medidas_usuario (
	id UUID NOT NULL, 
	usuario_id UUID NOT NULL, 
	altura_cm NUMERIC(5, 2) NOT NULL, 
	peso_kg NUMERIC(5, 2) NOT NULL, 
	pecho_cm NUMERIC(6, 2), 
	cintura_cm NUMERIC(6, 2), 
	cadera_cm NUMERIC(6, 2), 
	hombro_cm NUMERIC(6, 2), 
	fuente VARCHAR(40) NOT NULL, 
	es_actual BOOLEAN NOT NULL, 
	medido_en TIMESTAMP WITH TIME ZONE DEFAULT 'now()' NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_medidas_usuario_id FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
)

;


CREATE TABLE pedidos (
	id UUID NOT NULL, 
	usuario_id UUID NOT NULL, 
	estado_pedido_id UUID NOT NULL, 
	numero_pedido VARCHAR(30) NOT NULL, 
	subtotal NUMERIC(12, 2) NOT NULL, 
	descuento NUMERIC(12, 2) NOT NULL, 
	costo_envio NUMERIC(12, 2) NOT NULL, 
	impuestos NUMERIC(12, 2) NOT NULL, 
	total NUMERIC(12, 2) NOT NULL, 
	moneda VARCHAR(3) NOT NULL, 
	direccion_envio JSONB NOT NULL, 
	notas_cliente TEXT, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_pedidos_usuario_id FOREIGN KEY(usuario_id) REFERENCES usuarios (id), 
	CONSTRAINT fk_pedidos_estado_id FOREIGN KEY(estado_pedido_id) REFERENCES estados_pedido (id), 
	UNIQUE (numero_pedido)
)

;


CREATE TABLE prendas_3d (
	id UUID NOT NULL, 
	producto_id UUID, 
	codigo VARCHAR(80) NOT NULL, 
	nombre VARCHAR(160) NOT NULL, 
	tipo_prenda VARCHAR(40) NOT NULL, 
	genero VARCHAR(20) NOT NULL, 
	url_glb TEXT NOT NULL, 
	url_usdz TEXT, 
	url_miniatura TEXT, 
	escala_base NUMERIC(6, 4) NOT NULL, 
	metadatos JSONB NOT NULL, 
	activo BOOLEAN NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_prendas_3d_producto_id FOREIGN KEY(producto_id) REFERENCES productos (id) ON DELETE SET NULL, 
	UNIQUE (codigo)
)

;


CREATE TABLE variantes_producto (
	id UUID NOT NULL, 
	producto_id UUID NOT NULL, 
	talla_id UUID NOT NULL, 
	color_id UUID NOT NULL, 
	sku VARCHAR(80) NOT NULL, 
	precio NUMERIC(12, 2), 
	existencias INTEGER NOT NULL, 
	activo BOOLEAN NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_variantes_producto_talla_color UNIQUE (producto_id, talla_id, color_id), 
	CONSTRAINT fk_variantes_producto_id FOREIGN KEY(producto_id) REFERENCES productos (id) ON DELETE CASCADE, 
	CONSTRAINT fk_variantes_talla_id FOREIGN KEY(talla_id) REFERENCES tallas (id), 
	CONSTRAINT fk_variantes_color_id FOREIGN KEY(color_id) REFERENCES colores (id)
)

;


CREATE TABLE carrito_detalle (
	id UUID NOT NULL, 
	carrito_id UUID NOT NULL, 
	variante_id UUID NOT NULL, 
	cantidad INTEGER NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_carrito_detalle_variante UNIQUE (carrito_id, variante_id), 
	CONSTRAINT fk_carrito_detalle_carrito_id FOREIGN KEY(carrito_id) REFERENCES carrito (id) ON DELETE CASCADE, 
	CONSTRAINT fk_carrito_detalle_variante_id FOREIGN KEY(variante_id) REFERENCES variantes_producto (id)
)

;


CREATE TABLE envios (
	id UUID NOT NULL, 
	pedido_id UUID NOT NULL, 
	transportista VARCHAR(80), 
	numero_seguimiento VARCHAR(120), 
	estado VARCHAR(30) NOT NULL, 
	costo NUMERIC(12, 2) NOT NULL, 
	fecha_estimada DATE, 
	enviado_en TIMESTAMP WITH TIME ZONE, 
	entregado_en TIMESTAMP WITH TIME ZONE, 
	direccion_snapshot JSONB NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (pedido_id), 
	CONSTRAINT fk_envios_pedido_id FOREIGN KEY(pedido_id) REFERENCES pedidos (id) ON DELETE CASCADE
)

;


CREATE TABLE historial_estados_pedido (
	id UUID NOT NULL, 
	pedido_id UUID NOT NULL, 
	estado_pedido_id UUID NOT NULL, 
	usuario_id UUID, 
	comentario TEXT, 
	metadatos JSONB NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_historial_pedido_id FOREIGN KEY(pedido_id) REFERENCES pedidos (id) ON DELETE CASCADE, 
	CONSTRAINT fk_historial_estado_id FOREIGN KEY(estado_pedido_id) REFERENCES estados_pedido (id), 
	CONSTRAINT fk_historial_usuario_id FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
)

;


CREATE TABLE medidas_prenda (
	id UUID NOT NULL, 
	variante_id UUID NOT NULL, 
	largo_cm NUMERIC(6, 2), 
	ancho_cm NUMERIC(6, 2), 
	manga_cm NUMERIC(6, 2), 
	hombro_cm NUMERIC(6, 2), 
	pecho_cm NUMERIC(6, 2), 
	cintura_cm NUMERIC(6, 2), 
	calce VARCHAR(30) NOT NULL, 
	notas TEXT, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (variante_id), 
	CONSTRAINT fk_medidas_prenda_variante_id FOREIGN KEY(variante_id) REFERENCES variantes_producto (id) ON DELETE CASCADE
)

;


CREATE TABLE pagos (
	id UUID NOT NULL, 
	pedido_id UUID NOT NULL, 
	metodo VARCHAR(40) NOT NULL, 
	proveedor VARCHAR(60), 
	referencia_externa VARCHAR(120), 
	monto NUMERIC(12, 2) NOT NULL, 
	moneda VARCHAR(3) NOT NULL, 
	estado VARCHAR(30) NOT NULL, 
	pagado_en TIMESTAMP WITH TIME ZONE, 
	metadatos JSONB NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_pagos_pedido_id FOREIGN KEY(pedido_id) REFERENCES pedidos (id) ON DELETE CASCADE
)

;


CREATE TABLE pedido_detalle (
	id UUID NOT NULL, 
	pedido_id UUID NOT NULL, 
	variante_id UUID NOT NULL, 
	cantidad INTEGER NOT NULL, 
	precio_unitario NUMERIC(12, 2) NOT NULL, 
	subtotal_linea NUMERIC(12, 2) NOT NULL, 
	nombre_snapshot VARCHAR(255) NOT NULL, 
	sku_snapshot VARCHAR(80) NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_pedido_detalle_pedido_id FOREIGN KEY(pedido_id) REFERENCES pedidos (id) ON DELETE CASCADE, 
	CONSTRAINT fk_pedido_detalle_variante_id FOREIGN KEY(variante_id) REFERENCES variantes_producto (id)
)

;


CREATE TABLE pedidos_personalizados (
	id UUID NOT NULL, 
	usuario_id UUID NOT NULL, 
	producto_id UUID, 
	variante_id UUID, 
	estado_personalizacion_id UUID NOT NULL, 
	numero_solicitud VARCHAR(30) NOT NULL, 
	texto_personalizado VARCHAR(500), 
	color_solicitado VARCHAR(80), 
	talla_id UUID, 
	url_imagen_referencia TEXT, 
	descripcion TEXT, 
	presupuesto_estimado NUMERIC(12, 2), 
	moneda VARCHAR(3) NOT NULL, 
	notas_internas TEXT, 
	metadatos JSONB NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_pedidos_pers_usuario_id FOREIGN KEY(usuario_id) REFERENCES usuarios (id), 
	CONSTRAINT fk_pedidos_pers_producto_id FOREIGN KEY(producto_id) REFERENCES productos (id) ON DELETE SET NULL, 
	CONSTRAINT fk_pedidos_pers_variante_id FOREIGN KEY(variante_id) REFERENCES variantes_producto (id) ON DELETE SET NULL, 
	CONSTRAINT fk_pedidos_pers_estado_id FOREIGN KEY(estado_personalizacion_id) REFERENCES estados_personalizacion (id), 
	UNIQUE (numero_solicitud), 
	CONSTRAINT fk_pedidos_pers_talla_id FOREIGN KEY(talla_id) REFERENCES tallas (id) ON DELETE SET NULL
)

;


CREATE TABLE recomendaciones_talla (
	id UUID NOT NULL, 
	usuario_id UUID NOT NULL, 
	producto_id UUID, 
	variante_id UUID, 
	talla_id UUID NOT NULL, 
	nivel_confianza NUMERIC(5, 4) NOT NULL, 
	explicacion TEXT NOT NULL, 
	version_modelo VARCHAR(60) NOT NULL, 
	entrada JSONB NOT NULL, 
	salida JSONB NOT NULL, 
	aceptada_por_usuario BOOLEAN, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_recomendaciones_usuario_id FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE, 
	CONSTRAINT fk_recomendaciones_producto_id FOREIGN KEY(producto_id) REFERENCES productos (id) ON DELETE SET NULL, 
	CONSTRAINT fk_recomendaciones_variante_id FOREIGN KEY(variante_id) REFERENCES variantes_producto (id) ON DELETE SET NULL, 
	CONSTRAINT fk_recomendaciones_talla_id FOREIGN KEY(talla_id) REFERENCES tallas (id)
)

;


CREATE TABLE sesiones_probador (
	id UUID NOT NULL, 
	usuario_id UUID, 
	avatar_id UUID, 
	prenda_3d_id UUID, 
	variante_id UUID, 
	talla_id UUID, 
	token_sesion VARCHAR(128), 
	dispositivo VARCHAR(80), 
	iniciada_en TIMESTAMP WITH TIME ZONE DEFAULT 'now()' NOT NULL, 
	finalizada_en TIMESTAMP WITH TIME ZONE, 
	eventos JSONB NOT NULL, 
	metadatos JSONB NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_sesiones_usuario_id FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL, 
	CONSTRAINT fk_sesiones_avatar_id FOREIGN KEY(avatar_id) REFERENCES avatares_usuario (id) ON DELETE SET NULL, 
	CONSTRAINT fk_sesiones_prenda_id FOREIGN KEY(prenda_3d_id) REFERENCES prendas_3d (id) ON DELETE SET NULL, 
	CONSTRAINT fk_sesiones_variante_id FOREIGN KEY(variante_id) REFERENCES variantes_producto (id) ON DELETE SET NULL, 
	CONSTRAINT fk_sesiones_talla_id FOREIGN KEY(talla_id) REFERENCES tallas (id) ON DELETE SET NULL
)

;


CREATE TABLE disenos_personalizados (
	id UUID NOT NULL, 
	pedido_personalizado_id UUID NOT NULL, 
	usuario_id UUID NOT NULL, 
	titulo VARCHAR(200) NOT NULL, 
	descripcion TEXT, 
	url_vista_previa TEXT, 
	version INTEGER NOT NULL, 
	es_aprobado BOOLEAN NOT NULL, 
	metadatos JSONB NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_disenos_pedido_personalizado_id FOREIGN KEY(pedido_personalizado_id) REFERENCES pedidos_personalizados (id) ON DELETE CASCADE, 
	CONSTRAINT fk_disenos_usuario_id FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
)

;


CREATE TABLE historial_estados_personalizacion (
	id UUID NOT NULL, 
	pedido_personalizado_id UUID NOT NULL, 
	estado_personalizacion_id UUID NOT NULL, 
	usuario_id UUID, 
	comentario TEXT, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_hist_pers_pedido_id FOREIGN KEY(pedido_personalizado_id) REFERENCES pedidos_personalizados (id) ON DELETE CASCADE, 
	CONSTRAINT fk_hist_pers_estado_id FOREIGN KEY(estado_personalizacion_id) REFERENCES estados_personalizacion (id), 
	CONSTRAINT fk_hist_pers_usuario_id FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
)

;


CREATE TABLE archivos_diseno (
	id UUID NOT NULL, 
	diseno_id UUID NOT NULL, 
	url TEXT NOT NULL, 
	nombre_archivo VARCHAR(255) NOT NULL, 
	tipo_mime VARCHAR(120) NOT NULL, 
	tamano_bytes BIGINT, 
	es_principal BOOLEAN NOT NULL, 
	metadatos JSONB NOT NULL, 
	creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT fk_archivos_diseno_id FOREIGN KEY(diseno_id) REFERENCES disenos_personalizados (id) ON DELETE CASCADE
)

;


DROP TRIGGER IF EXISTS trg_categorias_actualizado_en ON categorias;
CREATE TRIGGER trg_categorias_actualizado_en
  BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_colores_actualizado_en ON colores;
CREATE TRIGGER trg_colores_actualizado_en
  BEFORE UPDATE ON colores
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_estados_pedido_actualizado_en ON estados_pedido;
CREATE TRIGGER trg_estados_pedido_actualizado_en
  BEFORE UPDATE ON estados_pedido
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_estados_personalizacion_actualizado_en ON estados_personalizacion;
CREATE TRIGGER trg_estados_personalizacion_actualizado_en
  BEFORE UPDATE ON estados_personalizacion
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_roles_actualizado_en ON roles;
CREATE TRIGGER trg_roles_actualizado_en
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_tallas_actualizado_en ON tallas;
CREATE TRIGGER trg_tallas_actualizado_en
  BEFORE UPDATE ON tallas
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_productos_actualizado_en ON productos;
CREATE TRIGGER trg_productos_actualizado_en
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_usuarios_actualizado_en ON usuarios;
CREATE TRIGGER trg_usuarios_actualizado_en
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_avatares_usuario_actualizado_en ON avatares_usuario;
CREATE TRIGGER trg_avatares_usuario_actualizado_en
  BEFORE UPDATE ON avatares_usuario
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_carrito_actualizado_en ON carrito;
CREATE TRIGGER trg_carrito_actualizado_en
  BEFORE UPDATE ON carrito
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_direcciones_usuario_actualizado_en ON direcciones_usuario;
CREATE TRIGGER trg_direcciones_usuario_actualizado_en
  BEFORE UPDATE ON direcciones_usuario
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_imagenes_producto_actualizado_en ON imagenes_producto;
CREATE TRIGGER trg_imagenes_producto_actualizado_en
  BEFORE UPDATE ON imagenes_producto
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_medidas_usuario_actualizado_en ON medidas_usuario;
CREATE TRIGGER trg_medidas_usuario_actualizado_en
  BEFORE UPDATE ON medidas_usuario
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_pedidos_actualizado_en ON pedidos;
CREATE TRIGGER trg_pedidos_actualizado_en
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_prendas_3d_actualizado_en ON prendas_3d;
CREATE TRIGGER trg_prendas_3d_actualizado_en
  BEFORE UPDATE ON prendas_3d
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_variantes_producto_actualizado_en ON variantes_producto;
CREATE TRIGGER trg_variantes_producto_actualizado_en
  BEFORE UPDATE ON variantes_producto
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_carrito_detalle_actualizado_en ON carrito_detalle;
CREATE TRIGGER trg_carrito_detalle_actualizado_en
  BEFORE UPDATE ON carrito_detalle
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_envios_actualizado_en ON envios;
CREATE TRIGGER trg_envios_actualizado_en
  BEFORE UPDATE ON envios
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_medidas_prenda_actualizado_en ON medidas_prenda;
CREATE TRIGGER trg_medidas_prenda_actualizado_en
  BEFORE UPDATE ON medidas_prenda
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_pagos_actualizado_en ON pagos;
CREATE TRIGGER trg_pagos_actualizado_en
  BEFORE UPDATE ON pagos
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_pedido_detalle_actualizado_en ON pedido_detalle;
CREATE TRIGGER trg_pedido_detalle_actualizado_en
  BEFORE UPDATE ON pedido_detalle
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_pedidos_personalizados_actualizado_en ON pedidos_personalizados;
CREATE TRIGGER trg_pedidos_personalizados_actualizado_en
  BEFORE UPDATE ON pedidos_personalizados
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_recomendaciones_talla_actualizado_en ON recomendaciones_talla;
CREATE TRIGGER trg_recomendaciones_talla_actualizado_en
  BEFORE UPDATE ON recomendaciones_talla
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_sesiones_probador_actualizado_en ON sesiones_probador;
CREATE TRIGGER trg_sesiones_probador_actualizado_en
  BEFORE UPDATE ON sesiones_probador
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_disenos_personalizados_actualizado_en ON disenos_personalizados;
CREATE TRIGGER trg_disenos_personalizados_actualizado_en
  BEFORE UPDATE ON disenos_personalizados
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();


DROP TRIGGER IF EXISTS trg_archivos_diseno_actualizado_en ON archivos_diseno;
CREATE TRIGGER trg_archivos_diseno_actualizado_en
  BEFORE UPDATE ON archivos_diseno
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();
