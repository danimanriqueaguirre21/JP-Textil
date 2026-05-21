# Requerimientos Funcionales - JotaPe VF

## RF-01: Registro de Usuario
- **Actor:** Cliente
- **Descripción:** El sistema permite registrar nuevos clientes
- **Prioridad:** Alta
- **Estado:** ✅ Implementado / 🚧 En desarrollo / ⏳ Pendiente

## RF-02: Autenticación de Usuario
- **Actor:** Cliente
- **Descripción:** Validación de credenciales de acceso
- **Prioridad:** Alta

## RF-03: Visualización de Productos
- **Actor:** Cliente
- **Descripción:** Mostrar catálogo actualizado
- **Prioridad:** Alta

## RF-04: Filtrado de Productos
- **Actor:** Cliente
- **Descripción:** Búsqueda por criterios (categoría, talla, precio)
- **Prioridad:** Media

## RF-05: Ingreso de Datos del Cliente
- **Actor:** Cliente
- **Descripción:** Capturar datos físicos (peso, altura, pecho, cintura, cadera)
- **Prioridad:** Alta

## RF-06: Predicción de Talla (ML)
- **Actor:** Sistema (ML) + Cliente
- **Descripción:** Calcular talla ideal mediante Machine Learning
- **Prioridad:** Crítica ⭐

## RF-07: Recomendación de Talla
- **Actor:** Sistema
- **Descripción:** Mostrar talla sugerida con nivel de confianza
- **Prioridad:** Crítica ⭐

## RF-08: Gestión de Carrito
- **Actor:** Cliente
- **Descripción:** Agregar/eliminar productos del carrito
- **Prioridad:** Alta

## RF-09: Registro de Pedido
- **Actor:** Cliente + Sistema
- **Descripción:** Generar pedidos con código de seguimiento único
- **Prioridad:** Alta

## RF-10: Validación de Pago
- **Actor:** Sistema + Pasarela de Pagos
- **Descripción:** Validar transacciones digitales (Yape, Plin, transferencia)
- **Prioridad:** Alta

## RF-11: Gestión de Envío
- **Actor:** Sistema + Administrador
- **Descripción:** Administrar entrega con empresas de transporte
- **Prioridad:** Media

## RF-12: Confirmación de Recepción
- **Actor:** Cliente
- **Descripción:** Registrar entrega confirmada
- **Prioridad:** Media

## RF-13: Gestión de Postventa
- **Actor:** Cliente + Administrador
- **Descripción:** Gestionar reclamos y devoluciones
- **Prioridad:** Baja

## RF-14: Generación de Reportes
- **Actor:** Administrador
- **Descripción:** Reportes analíticos (ventas, precisión ML, devoluciones)
- **Prioridad:** Media

# Requerimientos No Funcionales

## RNF-01
Sistema responsive.

## RNF-02
Interfaz moderna y amigable.

## RNF-03
Tiempo de respuesta rápido.

## RNF-04
Arquitectura escalable.

## RNF-05
Código mantenible.

## RNF-06
Compatibilidad multiplataforma.

## RNF-07
Protección de datos de usuarios.

## RNF-08
Preparado para integración futura con IA.