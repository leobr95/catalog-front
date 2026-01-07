# Documentación Back (Catalog API + Auth API)

> Documento pensado para entrevista: qué entrega el backend, cómo está hecho y por qué cumple la prueba técnica.

---

## 1) Objetivo
Backend para un **panel de catálogo** que permite:

- **Autenticación con JWT** (login / register / me)
- **Gestión de Categorías y Productos** (CRUD)
- **Listado paginado + filtros + ordenamiento**
- **Carga masiva** de productos por **CSV/XLSX**
- Respuestas consistentes para consumo por Front (Next.js)

---

## 2) Stack / Tecnologías
- **.NET (Web API)**
- **JWT Bearer Authentication**
- **Swagger/OpenAPI** (documentación + pruebas)
- **Persistencia** (según tu implementación):
  - Entity Framework Core + SQL (recomendado)
  - o repositorios/servicios por capa
- **Validaciones** en capa de aplicación / dominio

---

## 3) Arquitectura
### Separación por módulos
- **Auth Service**
  - Responsabilidad: seguridad, emisión/validación de tokens.
  - Endpoints: login / register / me.
- **Catalog API**
  - Responsabilidad: CRUD de Categorías y Productos, búsqueda, paginación, importación masiva.

### Capas típicas
- **API / Controllers**: reciben requests, validan lo básico, retornan DTOs.
- **Application / Services**: lógica de negocio (crear, editar, soft delete, búsquedas).
- **Infrastructure**: acceso a datos (EF Core / repositorios / DB).
- **Domain**: entidades, reglas de negocio.

---

## 4) Endpoints (Back)

### A) Auth
#### `POST /api/auth/login`
- **Body**:
```json
{ "email": "user@demo.com", "password": "123456" }
```
- **Response**:
```json
{
  "accessToken": "jwt...",
  "refreshToken": "optional",
  "expiresAt": "2026-01-07T12:00:00Z",
  "user": { "id": "...", "email": "...", "fullName": "..." }
}
```

#### `POST /api/auth/register`
- **Body**:
```json
{ "email": "new@demo.com", "password": "123456", "fullName": "Nombre Apellido" }
```

#### `GET /api/auth/me`
- Headers: `Authorization: Bearer <token>`
- Retorna el usuario actual.

---

### B) Categorías (Catalog)
#### `GET /api/categorias`
**Query params:**
- `includeInactive=true|false`
- `search=texto`

**Response**: array de categorías.

#### `POST /api/categorias`
Crea categoría.

#### `PUT /api/categorias/{id}`
Actualiza categoría.

#### `DELETE /api/categorias/{id}`
Soft delete / inactiva (según regla).

---

### C) Productos (Catalog)
#### `GET /api/productos`
**Query params:**
- `page`, `pageSize`
- `search`
- `idCategoria`
- `precioMin`, `precioMax`
- `activo`
- `sortBy=fechaCreacion|nombre|precio`
- `sortDir=asc|desc`

**Response** (paginado):
```json
{ "items": [], "total": 0, "page": 1, "pageSize": 10 }
```

#### `POST /api/productos`
Crea producto.

#### `PUT /api/productos/{id}`
Actualiza producto.

#### `DELETE /api/productos/{id}`
Soft delete / inactiva (según regla).

---

### D) Carga masiva
#### `POST /api/productos/masivo`
- `multipart/form-data`
- Campo: `file` (CSV o XLSX)

**Response**:
```json
{
  "inserted": 10,
  "updated": 5,
  "failed": 2,
  "errors": [
    { "row": 12, "message": "Categoria not found." }
  ]
}
```

✅ Este formato permite que el front muestre **resumen + detalle** de errores por fila.

---

## 5) Reglas de negocio importantes
- **SKU único** (recomendado)
- Producto debe referenciar una **Categoría existente**
  - Error típico: `Categoria not found.` si el CSV trae un `idCategoria` inexistente.
- **Soft delete**:
  - Al eliminar, se marca `activo=false` (o `deletedAt`)
- **Filtros combinables**:
  - search + idCategoria + precios + estado + sort + paginación

---

## 6) Seguridad
- Endpoints de catálogo protegidos con:
  - `Authorization: Bearer <JWT>`
- Validación JWT:
  - issuer/audience (según configuración)
  - expiración (`exp`)
- CORS configurado para permitir el front (local y deploy), si aplica.

---

## 7) Errores y respuestas consistentes
El backend retorna errores con alguna de estas formas (compatibles con el wrapper del front):
- `{ "errors": ["..."] }`
- `{ "message": "..." }`
- `{ "title": "..." }`

---

## 8) Cómo correr en local (demo)
Ejemplo (puertos típicos):
- Auth: `http://localhost:5267`
- Catalog: `http://localhost:5054`

1) Levantar DB (si aplica)
2) Correr Auth API
3) Correr Catalog API
4) Verificar Swagger:
   - `/swagger`

---

## 9) Justificación: ¿Cumple la prueba técnica (Back)?
Sí, porque entrega:
- autenticación real con JWT
- CRUD de categorías y productos
- paginación + filtros + ordenamiento
- carga masiva con reporte de filas fallidas
- contrato claro y consumible por el front

---
