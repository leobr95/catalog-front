import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { request } from "@/app/lib/api";
import { uiActions } from "./uiSlice";
import type { CategoriaDto, CategoriaCreateUpdateDto } from "@/app/types/api";
import { confirmDelete, toastSuccess } from "@/app/lib/alerts";

type State = {
  items: CategoriaDto[];
  loading: boolean;
};

const initialState: State = {
  items: [],
  loading: false,
};

export const fetchCategorias = createAsyncThunk(
  "categorias/fetchAll",
  async ({ includeInactive, search }: { includeInactive: boolean; search: string | null }, thunkApi) => {
    const token = (thunkApi.getState() as RootState).auth.token;
    if (!token) throw new Error("Missing token");

    const qs = new URLSearchParams();
    qs.set("includeInactive", String(includeInactive));
    if (search) qs.set("search", search);

    return await request<CategoriaDto[]>(`/categorias?${qs.toString()}`, { method: "GET", token });
  }
);

export const createCategoria = createAsyncThunk(
  "categorias/create",
  async ({ dto }: { dto: CategoriaCreateUpdateDto }, thunkApi) => {
    const token = (thunkApi.getState() as RootState).auth.token;
    if (!token) throw new Error("Missing token");

    thunkApi.dispatch(uiActions.beginLoading());
    try {
      await request(`/categorias`, { method: "POST", token, body: JSON.stringify(dto) });
      await thunkApi.dispatch(fetchCategorias({ includeInactive: true, search: null }));
      return true;
    } finally {
      thunkApi.dispatch(uiActions.endLoading());
    }
  }
);

export const updateCategoria = createAsyncThunk(
  "categorias/update",
  async ({ id, dto }: { id: number; dto: CategoriaCreateUpdateDto }, thunkApi) => {
    const token = (thunkApi.getState() as RootState).auth.token;
    if (!token) throw new Error("Missing token");

    thunkApi.dispatch(uiActions.beginLoading());
    try {
      await request(`/categorias/${id}`, { method: "PUT", token, body: JSON.stringify(dto) });
      await thunkApi.dispatch(fetchCategorias({ includeInactive: true, search: null }));
      return true;
    } finally {
      thunkApi.dispatch(uiActions.endLoading());
    }
  }
);

export const deleteCategoria = createAsyncThunk(
  "categorias/delete",
  async ({ id }: { id: number }, thunkApi) => {
    const token = (thunkApi.getState() as RootState).auth.token;
    if (!token) throw new Error("Missing token");

    const ok = await confirmDelete("Eliminar categoría", `¿Seguro que deseas eliminar la categoría #${id}? (soft delete)`);
    if (!ok) return false;

    thunkApi.dispatch(uiActions.beginLoading());
    try {
      await request(`/api/categorias/${id}`, { method: "DELETE", token });
      toastSuccess("Categoría eliminada");
      await thunkApi.dispatch(fetchCategorias({ includeInactive: true, search: null }));
      return true;
    } finally {
      thunkApi.dispatch(uiActions.endLoading());
    }
  }
);

const slice = createSlice({
  name: "categorias",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCategorias.pending, (s) => {
      s.loading = true;
    });
    b.addCase(fetchCategorias.fulfilled, (s, a) => {
      s.loading = false;
      s.items = a.payload ?? [];
    });
    b.addCase(fetchCategorias.rejected, (s) => {
      s.loading = false;
    });
  },
});

export const selectCategorias = (s: RootState) => s.categorias.items;
export const selectCategoriasLoading = (s: RootState) => s.categorias.loading;

export default slice.reducer;
