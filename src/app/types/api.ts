// app/types/api.ts

export type PagedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/** =========================
 * Categorías (Catalog API)
 * ========================= */
export type CategoriaDto = {
  idCategoria: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  fechaCreacion: string; // ISO
  fechaModificacion: string; // ISO
  [k: string]: unknown;
};

export type CategoriaCreateUpdateDto = {
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
};

/** =========================
 * Productos (Catalog API)
 * ========================= */
export type ProductoListItemDto = {
  idProducto: number;
  nombre: string;
  idCategoria: number;
  categoriaNombre?: string | null;
  sku?: string | null;
  precio: number;
  stock: number;
  activo: boolean;
  fechaCreacion: string; // ISO
  fechaModificacion: string; // ISO
  [k: string]: unknown;
};

export type ProductoCreateUpdateDto = {
  sku: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  idCategoria: number;
  activo?: boolean;
};

/** =========================
 * Bulk Import
 * ========================= */
export type BulkImportErrorDto = {
  row: number;
  message: string;
};

export type BulkImportResultDto = {
  upserted?: number;
  inserted?: number;
  updated?: number;
  failed?: number;
  errors?: BulkImportErrorDto[] | string[];
  [k: string]: unknown;
};
