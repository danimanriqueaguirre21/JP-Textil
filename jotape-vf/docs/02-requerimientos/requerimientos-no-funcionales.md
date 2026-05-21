#Requerimientos No Funcionales

## Matriz de Requerimientos No Funcionales

| ID | Categoría | Atributo | Descripción | Métrica | Prioridad |
|:---|:----------|:---------|:------------|:--------|:----------|
| **RNF-01** | Rendimiento | Tiempo de respuesta | El sistema debe responder en menos de 2 segundos para el 95% de las peticiones | < 2s (P95) | 🔴 Alta |
| **RNF-02** | Seguridad | Protección de datos | Cifrado de contraseñas con bcrypt, tokens JWT, datos sensibles protegidos | Cumplimiento ISO 27001 | 🔴 Alta |
| **RNF-03** | Usabilidad | Facilidad de uso | Interfaz intuitiva, navegación clara, accesible desde dispositivos móviles | SUS Score > 80 | 🟡 Media |
| **RNF-04** | Disponibilidad | Acceso continuo | Sistema disponible 24/7 con ventanas de mantenimiento programadas | 99.5% uptime | 🟡 Media |
| **RNF-05** | Escalabilidad | Soporte de usuarios | Arquitectura que soporte crecimiento de usuarios y transacciones | 1000 usuarios concurrentes | 🟡 Media |
| **RNF-06** | Compatibilidad | Multiplataforma | Funcionamiento en Chrome, Firefox, Safari, Edge (últimas 2 versiones) | Cross-browser testing | 🟡 Media |
| **RNF-07** | Mantenibilidad | Facilidad de cambios | Código limpio, documentado, con tests automatizados | Cobertura > 80% | 🟡 Media |
| **RNF-08** | Fiabilidad | Funcionamiento estable | Minimizar fallos, recuperación automática ante errores | < 0.1% tasa de error | 🔴 Alta |

---

## Especificaciones Detalladas

### RNF-01: Rendimiento

| Escenario | Tiempo Máximo | Métrica |
|:----------|:--------------|:--------|
| Carga de página inicial | 1.5 segundos | First Contentful Paint |
| Predicción de talla (ML) | 500 milisegundos | API response time |
| Listado de productos | 800 milisegundos | API response time |
| Proceso de checkout | 2 segundos | Total transaction time |
| Reportes administrativos | 3 segundos | Query execution time |

### RNF-02: Seguridad

| Control | Implementación | Verificación |
|:--------|:---------------|:-------------|
| Autenticación | JWT con expiración de 30 min | Pentest |
| Autorización | Roles (cliente/admin) con middleware | Unit tests |
| Contraseñas | bcrypt con 12 rounds | Auditoría de código |
| Datos en tránsito | HTTPS/TLS 1.3 | SSL Labs scan |
| Validación de entrada | Sanitización frontend y backend | OWASP ZAP |
| Protección CSRF | Tokens CSRF en formularios | Automated tests |
| Headers de seguridad | HSTS, CSP, X-Frame-Options | Security headers scan |

### RNF-03: Usabilidad

**Principios de Diseño:**
- Mobile-first responsive design
- Contraste mínimo 4.5:1 (WCAG AA)
- Feedback inmediato en acciones del usuario
- Mensajes de error claros y orientados a solución
- Tiempo de aprendizaje < 5 minutos para nuevo usuario

---

## Estándares Aplicables

| Estándar | Aplicación en el Proyecto |
|:---------|:--------------------------|
| ISO/IEC 25010 | Modelo de calidad del producto software |
| ISO/IEC 29119 | Procesos de pruebas de software |
| ISO/IEC 27001 | Seguridad de la información |
| WCAG 2.1 AA | Accesibilidad web |
| OWASP Top 10 | Seguridad aplicaciones web |