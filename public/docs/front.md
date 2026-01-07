# Documentación Front (Catalog Front)

> Documento pensado para entrevista: qué entrega el front, cómo está hecho y por qué cumple la prueba técnica.

---

## 1) Objetivo
Aplicación web tipo “panel de catálogo” para **administrar Categorías y Productos**, consumiendo APIs externas con **JWT**, e incluyendo **CRUD completo**, **paginación + filtros**, **carga masiva** y un **MegaMenu** de búsqueda.

---

## 2) Stack
- **Next.js (App Router)** + React
- **TypeScript**
- **Ant Design (AntD)**
- **Redux Toolkit** (slices + thunks)
- **react-i18next** (multi-idioma ES/EN)
- **SweetAlert2 / Alerts helpers** (toasts/confirmaciones)

---

## 3) Arquitectura
### Estructura (alto nivel)
- `src/app/(dashboard)/...`  
  Páginas del panel (productos, categorías, layout).
- `src/app/components/...`  
  Componentes UI (Navbar, MegaMenu, Modales, etc.)
- `src/app/store/...`  
  Redux store + slices:
  - `authSlice`: login/register/logout, token y user
  - `uiSlice`: idioma, tema, modales, loaders y confirmaciones
  - `categoriasSlice`: fetch + CRUD
  - `productosSlice`: fetch paginado + filtros + CRUD + import masivo
- `src/app/lib/...`  
  Utilitarios:
  - `request()` wrapper de fetch
  - `i18n.ts` (recursos ES/EN + init)
  - `useDebounce` para búsqueda

### Flujo de datos (resumen)
UI → dispatch(thunk) → request(API) → reducer actualiza store → UI re-render.

---

## 4) Funcionalidades implementadas (Front)

### A) Autenticación (JWT demo)
- Modal de **Login / Register**
- Uso del token para consumir el catálogo vía `Authorization: Bearer <token>`
- UX: si no hay token, se muestra CTA para iniciar sesión

✅ **Cumple** autenticación funcional y control de acceso a pantallas protegidas.

---

### B) CRUD Categorías
- Tabla con:
  - ID, Nombre, Descripción, Activo, Acciones
- Crear/Editar en Modal con Form y validaciones
- Eliminar (soft delete) desde UI (confirmación desde estado global)

✅ **Cumple** CRUD completo con UI estándar (tabla + modal + validaciones).

---

### C) CRUD Productos + Paginación + Filtros
- Tabla paginada con:
  - ID, SKU, Nombre, Precio, Stock, Activo, Acciones
- Paginación real (`page`, `pageSize`)
- Filtros:
  - búsqueda por texto
  - filtro por categoría
  - rango de precios (min/max)
  - estado (Activos / Inactivos / Todos)
  - ordenamiento (fecha/nombre/precio + asc/desc)

✅ **Cumple** paginación y filtros como pieza central del caso.

---

### D) Importación masiva (CSV/XLSX)
- Modal con `Upload` AntD
- Acepta `.csv` y `.xlsx`
- Envía `multipart/form-data`
- Feedback: insertados / actualizados / fallidos

✅ **Cumple** bulk import con UX clara y resultado visible.

---

### E) MegaMenu (Drawer superior)
- Tabs:
  - **Categorías**: lista categorías y link a productos por categoría
  - **Buscar**: búsqueda global con debounce:
    - coincidencias de categorías
    - coincidencias de productos (top 10, sort fecha desc)
- Al seleccionar una categoría: actualiza query global de productos y navega

✅ **Cumple** navegación rápida tipo e-commerce + búsqueda eficiente.

---

### F) Multi-idioma ES/EN
- Toggle desde Navbar
- `Providers.tsx` escucha `lang` (Redux) y ejecuta `i18n.changeLanguage(lang)`
- Textos principales migrados a `t("...")` con recursos en `lib/i18n.ts`

✅ **Cumple** internacionalización real y escalable.

---

### G) Tema Dark / Light
- Toggle desde Navbar
- AntD `ConfigProvider` cambia `algorithm` según modo
- `globals.css` define fondo y estilos base compatibles

✅ **Cumple** experiencia de UI moderna con tema.

---

### H) UX / Calidad
- Loader global (`GlobalLoading`) durante thunks
- Notificaciones de éxito/error centralizadas (`toastSuccess`, `showError`)
- Validaciones en formularios (required, min chars, etc.)
- Tipado con DTOs (sin `any` en handlers clave)

✅ **Cumple** demo “presentable” y mantenible.

---

## 5) Endpoints utilizados (Front)
> El front consume endpoints del backend (según ambiente local/deploy).

### Auth
- `POST /api/Auth/login`
- `POST /api/Auth/register`
- `GET /api/Auth/me`

### Catálogo
- `GET/POST/PUT/DELETE /api/categorias`
- `GET/POST/PUT/DELETE /api/productos`
- `POST /api/productos/masivo`

---

## 6) Pasos de demo sugeridos (para el entrevistador)
1) Abrir app (se ve Navbar con toggles de idioma/tema)
2) Click **Login** → iniciar sesión (se obtiene JWT)
3) Ir a **Categorías**
   - crear una categoría
   - editarla
   - eliminarla (soft delete)
4) Ir a **Productos**
   - crear producto
   - filtrar por categoría / rango de precios
   - cambiar sort (fecha/nombre/precio)
   - paginar (pageSize)
5) Probar **Importar (CSV/XLSX)**
6) Abrir **MegaMenu**
   - Tab categorías (ir a productos)
   - Tab buscar (debounce y resultados)

---

## 7) Justificación: ¿Cumple la prueba técnica (Front)?
Sí, porque entrega:
- autenticación funcional (JWT) y control de acceso
- CRUD completo de categorías y productos
- paginación + filtros + ordenamiento
- carga masiva
- mega menú + búsqueda
- multi-idioma y dark/light
- arquitectura mantenible y tipada (Redux Toolkit + DTOs)

---

## 8) Notas / Consideraciones
- Para deploy en Vercel, las APIs deben estar accesibles públicamente (no `localhost`).
- Variables de entorno se deben configurar en Vercel y en local según el entorno.

---
