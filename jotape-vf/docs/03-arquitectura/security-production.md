# Seguridad production-ready — JotaPe VF

Arquitectura defensiva aplicada tras auditoría (prompt *Arquitecto Defensor*).

## Flujos BFF (navegador → Next.js → FastAPI)

```
Browser → /api/auth/*     → FastAPI (/auth/*, /users/me)
Browser → /api/predictions → FastAPI (/api/v1/predictions/)
```

Cookie HttpOnly `jotape_session` (JWT) en rutas de auth; el BFF de predicciones reenvía el Bearer si hay sesión.

- El JWT **no** se guarda en `localStorage`.
- `/account/*` protegido por `src/proxy.ts` (cookie presente).
- Perfil: `GET /api/auth/me`.
- Talla IA: `POST /api/predictions` (el cliente ya no llama a `:8000` directamente).

## Backend (FastAPI)

| Control | Implementación |
|---------|----------------|
| RBAC | `require_rol("admin")` en `src/shared/auth/deps.py` |
| Rate limit | `slowapi` — login/registro `10/min`, ML `30/min` |
| CORS | `CORS_ORIGINS` en `.env` (lista blanca) |
| JWT producción | `validate_settings()` exige secreto ≥ 32 chars y `DEBUG=false` |
| Errores 422 | Detalles solo si `DEBUG=true` |
| Admin ejemplo | `GET /admin/ping` (solo rol admin) |

## Frontend (Next.js)

| Control | Implementación |
|---------|----------------|
| Sesión | Route handlers `app/api/auth/*` |
| Predicciones ML | `POST /api/predictions` → `app/api/predictions/route.ts` |
| Headers | CSP, X-Frame-Options, nosniff en `next.config.ts` |
| Upload probador | Máx. 5 MB, JPEG/PNG/WebP |
| Cuenta | `proxy.ts` + `AccountGuard` |

## Variables de entorno

### Backend (`backend/.env`)

```env
ENVIRONMENT=production
DEBUG=false
JWT_SECRET_KEY=<openssl rand -hex 32>
CORS_ORIGINS=https://tudominio.com
RATE_LIMIT_ENABLED=true
RATE_LIMIT_AUTH=10/minute
RATE_LIMIT_PREDICTIONS=30/minute
```

### Frontend

```env
NEXT_PUBLIC_API_URL=https://api.tudominio.com
API_URL=https://api.tudominio.com
```

## Checklist antes de desplegar

- [ ] `JWT_SECRET_KEY` fuerte y único
- [ ] `DEBUG=false` en API
- [ ] HTTPS en reverse proxy (nginx / cloud)
- [ ] CORS solo dominios reales
- [ ] Rotar contraseña del admin de desarrollo
- [ ] `npm audit` y `pip audit`
- [ ] Backups PostgreSQL cifrados
- [ ] Logs sin contraseñas ni tokens
- [ ] WAF o rate limit en edge (opcional)

## Próximos pasos (opcional)

- Refresh tokens + rotación
- 2FA para admin
- Exigir sesión en BFF `/api/predictions` (opcional) o API key en edge
- Subida de imágenes al servidor con antivirus y almacenamiento S3 privado
