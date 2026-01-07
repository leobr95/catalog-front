import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { request } from "@/app/lib/api";
import { uiActions } from "./uiSlice";
import { confirmDelete, toastSuccess } from "@/app/lib/alerts";
import type {
  PagedResponse,
  ProductoListItemDto,
  ProductoCreateUpdateDto,
  BulkImportResultDto,
} from "@/app/types/api";

type Query = {
  page: number;
  pageSize: number;
  search: string | null;
  idCategoria: number | null;
  precioMin: number | null;
  precioMax: number | null;
  activo: boolean | null;
  sortBy: string;
  sortDir: "asc" | "desc";
};

type State = {
  query: Query;
  data: PagedResponse<ProductoListItemDto>;
  loading: boolean;
};

const initialState: State = {
  query: {
    page: 1,
    pageSize: 10,
    search: null,
    idCategoria: null,
    precioMin: null,
    precioMax: null,
    activo: null,
    sortBy: "fechaCreacion",
    sortDir: "desc",
  },
  data: { items: [], total: 0, page: 1, pageSize: 10 },
  loading: false,
};


const copy = {
  es: {
    missingToken: "Falta el token (debes iniciar sesión).",
    created: "Producto creado",
    updated: "Producto actualizado",
    deleted: "Producto eliminado",
    deleteTitle: "Eliminar producto",
    deleteText: (id: number) => `¿Seguro que deseas eliminar el producto #${id}? (soft delete)`,
  },
  en: {
    missingToken: "Missing token (you must sign in).",
    created: "Product created",
    updated: "Product updated",
    deleted: "Product deleted",
    deleteTitle: "Delete product",
    deleteText: (id: number) => `Are you sure you want to delete product #${id}? (soft delete)`,
  },
} as const;

type Lang = keyof typeof copy;

function getLang(state: RootState): Lang {
  const ui = (state as unknown as { ui?: Record<string, unknown> }).ui ?? {};
  const raw = (ui.lang ?? ui.language ?? ui.locale) as unknown;

  if (raw === "en" || raw === "es") return raw;
  return "es";
}

function t(state: RootState) {
  return copy[getLang(state)];
}

/** =========================
 * Thunks
 * ========================= */

export const fetchProductos = createAsyncThunk<
  PagedResponse<ProductoListItemDto>,
  void,
  { state: RootState }
>("productos/fetch", async (_, thunkApi) => {
  const s = thunkApi.getState();
  const token = s.auth.token;
  if (!token) throw new Error(t(s).missingToken);

  const q = s.productos.query;
  const qs = new URLSearchParams();
  qs.set("page", String(q.page));
  qs.set("pageSize", String(q.pageSize));
  if (q.search) qs.set("search", q.search);
  if (q.idCategoria != null) qs.set("idCategoria", String(q.idCategoria));
  if (q.precioMin != null) qs.set("precioMin", String(q.precioMin));
  if (q.precioMax != null) qs.set("precioMax", String(q.precioMax));
  if (q.activo != null) qs.set("activo", String(q.activo));
  qs.set("sortBy", q.sortBy);
  qs.set("sortDir", q.sortDir);

  return request<PagedResponse<ProductoListItemDto>>(`/productos?${qs.toString()}`, {
    method: "GET",
    token,
  });
});

export const createProducto = createAsyncThunk<
  boolean,
  { dto: ProductoCreateUpdateDto },
  { state: RootState }
>("productos/create", async ({ dto }, thunkApi) => {
  const s = thunkApi.getState();
  const token = s.auth.token;
  if (!token) throw new Error(t(s).missingToken);

  thunkApi.dispatch(uiActions.beginLoading());
  try {
    await request<void>(`/productos`, { method: "POST", token, body: JSON.stringify(dto) });
    toastSuccess(t(s).created);
    await thunkApi.dispatch(fetchProductos()).unwrap();
    return true;
  } finally {
    thunkApi.dispatch(uiActions.endLoading());
  }
});

export const updateProducto = createAsyncThunk<
  boolean,
  { id: number; dto: ProductoCreateUpdateDto },
  { state: RootState }
>("productos/update", async ({ id, dto }, thunkApi) => {
  const s = thunkApi.getState();
  const token = s.auth.token;
  if (!token) throw new Error(t(s).missingToken);

  thunkApi.dispatch(uiActions.beginLoading());
  try {
    await request<void>(`/productos/${id}`, { method: "PUT", token, body: JSON.stringify(dto) });
    toastSuccess(t(s).updated);
    await thunkApi.dispatch(fetchProductos()).unwrap();
    return true;
  } finally {
    thunkApi.dispatch(uiActions.endLoading());
  }
});

export const deleteProducto = createAsyncThunk<boolean, { id: number }, { state: RootState }>(
  "productos/delete",
  async ({ id }, thunkApi) => {
    const s = thunkApi.getState();
    const token = s.auth.token;
    if (!token) throw new Error(t(s).missingToken);

    const ok = await confirmDelete(t(s).deleteTitle, t(s).deleteText(id));
    if (!ok) return false;

    thunkApi.dispatch(uiActions.beginLoading());
    try {
      await request<void>(`/productos/${id}`, { method: "DELETE", token });
      toastSuccess(t(s).deleted);
      await thunkApi.dispatch(fetchProductos()).unwrap();
      return true;
    } finally {
      thunkApi.dispatch(uiActions.endLoading());
    }
  }
);

export const bulkImportProductos = createAsyncThunk<
  BulkImportResultDto,
  { file: File },
  { state: RootState }
>("productos/bulkImport", async ({ file }, thunkApi) => {
  const s = thunkApi.getState();
  const token = s.auth.token;
  if (!token) throw new Error(t(s).missingToken);

  const fd = new FormData();
  fd.append("file", file);

  thunkApi.dispatch(uiActions.beginLoading());
  try {
    const res = await request<BulkImportResultDto>(`/productos/masivo`, {
      method: "POST",
      token,
      body: fd, 
    });

    await thunkApi.dispatch(fetchProductos()).unwrap();
    return res;
  } finally {
    thunkApi.dispatch(uiActions.endLoading());
  }
});

/** =========================
 * Slice
 * ========================= */

const slice = createSlice({
  name: "productos",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<Partial<Query>>) {
      state.query = { ...state.query, ...action.payload };
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchProductos.pending, (s) => {
      s.loading = true;
    });
    b.addCase(fetchProductos.fulfilled, (s, a) => {
      s.loading = false;
      s.data = a.payload ?? { items: [], total: 0, page: s.query.page, pageSize: s.query.pageSize };
    });
    b.addCase(fetchProductos.rejected, (s) => {
      s.loading = false;
    });
  },
});

export const productosActions = slice.actions;

export const selectProductos = (s: RootState) => s.productos.data;
export const selectProductosLoading = (s: RootState) => s.productos.loading;
export const selectProductosQuery = (s: RootState) => s.productos.query;

export default slice.reducer;
