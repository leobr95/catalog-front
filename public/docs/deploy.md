# Documentación Deploy (Front + BFF + Back)

> Documento pensado para entrevista: cómo se despliega el aplicativo completo (local y producción), y cómo se conectan Front y APIs.

---

## 1) Objetivo de despliegue
Publicar el **Front (Next.js)** y conectar de forma segura con:
- **Auth API (.NET)**
- **Catalog API (.NET)**

El front incluye un **BFF (Backend For Frontend)** en Next:
- `/api/bff/auth/*` → forward a Auth API
- `/api/bff/catalog/*` → forward a Catalog API

✅ Con esto el navegador **solo llama al dominio del front**, y el front (servidor) reenvía a las APIs.

---

## 2) Arquitectura de despliegue

### Opción recomendada
- **Front (Next.js)** en Vercel
- **Auth API** en Render / Railway / Azure App Service
- **Catalog API** en Render / Railway / Azure App Service
- DB en (Postgres/SQL Server) según hosting

Flujo:
Browser → Vercel (Next) → Next BFF → Auth/Catalog APIs

---

## 3) Variables de entorno

### En Front (Vercel)
Configurar en `Settings → Environment Variables`:

- `AUTH_API_BASE_URL=https://tu-auth-api.com`
- `CATALOG_API_BASE_URL=https://tu-catalog-api.com`

En local:
- `AUTH_API_BASE_URL=http://localhost:5267`
- `CATALOG_API_BASE_URL=http://localhost:5054`

---

## 4) Next BFF (Forwarding)
Rutas típicas:
- `src/app/api/bff/auth/login/route.ts`
- `src/app/api/bff/auth/register/route.ts`
- `src/app/api/bff/auth/me/route.ts`
- `src/app/api/bff/catalog/[...path]/route.ts`

Consumo desde el front (si usas BFF):
- Auth: `/api/bff/auth/login`, `/api/bff/auth/register`, `/api/bff/auth/me`
- Catalog: `/api/bff/catalog/categorias`, `/api/bff/catalog/productos`, `/api/bff/catalog/productos/masivo`

---

## 5) Pasos de Deploy (Front en Vercel)
1) Subir repo a GitHub
2) Crear proyecto en Vercel → Import Git Repository
3) Setear variables de entorno (AUTH/CATALOG)
4) Deploy automático (build y release)
5) Probar rutas:
   - `/productos`
   - `/categorias`
   - login/register

---

## 6) Deploy del Back (Auth y Catalog)

### Requisitos comunes
- Variables de entorno:
  - `JWT_SECRET` / `JWT_KEY`
  - `JWT_ISSUER`
  - `JWT_AUDIENCE`
  - `ConnectionStrings__Default`

- Health check (recomendado):
  - `GET /health` o endpoint simple para monitoreo.

---

## 7) Consideraciones de producción
- **HTTPS**: siempre usar HTTPS en APIs.
- **Seguridad**: secreto JWT seguro, expiraciones correctas, refresh si aplica.
- **CORS**: si el navegador no llama directo (BFF), puede ser más restrictivo.

---

## 8) Checklist de validación final (deploy)
- [ ] Login funciona y devuelve JWT
- [ ] `/api/bff/auth/me` retorna usuario
- [ ] Categorías lista con token
- [ ] Productos lista paginada + filtros
- [ ] CRUD categorías/productos OK
- [ ] Carga masiva devuelve `inserted/updated/failed` y errores por fila
- [ ] ES/EN cambia textos y el modo Dark/Light cambia UI

---
