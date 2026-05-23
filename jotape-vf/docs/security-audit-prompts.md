# Security Audit Prompts

## Prompt 1 — Hacker Ético

Actúa como un hacker ético senior especializado en auditoría de aplicaciones web modernas.

Analiza mi proyecto completo de ecommerce + probador virtual IA y busca:

* vulnerabilidades
* malas prácticas
* fallos de seguridad
* exposición de datos
* errores de arquitectura
* riesgos de autenticación
* riesgos de frontend y backend

Tecnologías del proyecto:

* React / Next.js
* Tailwind
* Node.js
* PostgreSQL
* Prisma / SQLAlchemy
* MediaPipe
* Avatar 3D
* Upload de imágenes
* Pedidos personalizados

Quiero que intentes detectar:

1. SQL Injection
2. XSS
3. CSRF
4. Broken Authentication
5. Insecure Direct Object Reference
6. Exposición de rutas privadas
7. Fugas de datos
8. Problemas de JWT
9. Problemas de CORS
10. Riesgos en uploads de imágenes
11. Riesgos en archivos GLB/USDZ
12. Problemas en formularios
13. Validaciones faltantes
14. Errores de permisos
15. Riesgos en API routes
16. Riesgos en almacenamiento de contraseñas
17. Riesgos en localStorage
18. Problemas de rate limiting
19. Riesgos de escalabilidad
20. Riesgos en el probador virtual

Quiero:

* explicación del problema
* nivel de gravedad
* cómo explotarlo
* cómo mitigarlo
* ejemplos de código vulnerable
* ejemplos corregidos

También:

* revisa arquitectura frontend
* revisa backend
* revisa estructura de base de datos
* revisa flujo de autenticación
* revisa uploads y archivos multimedia

Al final:
genera una puntuación general de seguridad del proyecto y una checklist OWASP.

---

## Prompt 2 — Arquitecto Defensor

Actúa como un arquitecto senior de ciberseguridad y defensor de aplicaciones SaaS modernas.

Analiza mi plataforma ecommerce + probador virtual IA y ayúdame a fortalecerla siguiendo buenas prácticas profesionales.

Tecnologías:

* React / Next.js
* Tailwind
* Node.js
* PostgreSQL
* Prisma / SQLAlchemy
* MediaPipe
* Avatares 3D
* Upload de imágenes y modelos GLB

Necesito que revises:

1. Arquitectura segura frontend/backend
2. Seguridad PostgreSQL
3. Seguridad JWT
4. Protección de APIs
5. Protección contra XSS
6. Protección contra SQL Injection
7. Protección contra CSRF
8. Seguridad de uploads
9. Seguridad de imágenes y modelos 3D
10. Validaciones frontend y backend
11. Seguridad de autenticación
12. Roles y permisos
13. Protección de datos personales
14. Seguridad del probador virtual
15. Seguridad de MediaPipe
16. Seguridad de almacenamiento cloud
17. Headers HTTP recomendados
18. Configuración segura de CORS
19. Rate limiting
20. Logging y monitoreo

Quiero:

* recomendaciones profesionales
* ejemplos de código seguro
* middleware recomendado
* estructura segura del backend
* checklist de seguridad
* configuración recomendada para producción
* mejores prácticas OWASP
* mejoras de arquitectura

También:

* sugiere librerías de seguridad
* sugiere estructura escalable
* revisa separación frontend/backend
* revisa manejo de sesiones
* revisa manejo de archivos multimedia

Al final:
genera una arquitectura recomendada “production-ready” para este proyecto.

---

## OWASP Checklist

- SQL Injection
- XSS
- CSRF
- Broken Authentication
- etc...

---

## Notas de Seguridad

- JWT strategy
- File upload validation
- Rate limiting
- Secure headers
- PostgreSQL recommendations