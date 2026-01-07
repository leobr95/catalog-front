import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";

type Lang = "es" | "en";
type ThemeMode = "light" | "dark";

type UiState = {
  lang: Lang;
  theme: ThemeMode;
  loadingCount: number;

  loginOpen: boolean;

  // delete confirmations (IDs)
  deleteCategoriaId: number | null;
  deleteProductoId: number | null;
};

const initialState: UiState = {
  lang: "es",
  theme: "light",
  loadingCount: 0,
  loginOpen: false,
  deleteCategoriaId: null,
  deleteProductoId: null,
};

const slice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<Partial<Pick<UiState, "lang" | "theme">>>) {
      if (action.payload.lang) state.lang = action.payload.lang;
      if (action.payload.theme) state.theme = action.payload.theme;
    },
    toggleLang(state) {
      state.lang = state.lang === "es" ? "en" : "es";
    },
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    beginLoading(state) {
      state.loadingCount += 1;
    },
    endLoading(state) {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
    },
    openLogin(state) {
      state.loginOpen = true;
    },
    closeLogin(state) {
      state.loginOpen = false;
    },

    openDeleteCategoria(state, action: PayloadAction<number>) {
      state.deleteCategoriaId = action.payload;
    },
    clearDeleteCategoria(state) {
      state.deleteCategoriaId = null;
    },

    openDeleteProducto(state, action: PayloadAction<number>) {
      state.deleteProductoId = action.payload;
    },
    clearDeleteProducto(state) {
      state.deleteProductoId = null;
    },
  },
});

export const uiActions = slice.actions;

export const selectLang = (s: RootState) => s.ui.lang;
export const selectThemeMode = (s: RootState) => s.ui.theme;
export const selectLoading = (s: RootState) => s.ui.loadingCount > 0;
export const selectLoginOpen = (s: RootState) => s.ui.loginOpen;

export const selectDeleteCategoriaId = (s: RootState) => s.ui.deleteCategoriaId;
export const selectDeleteProductoId = (s: RootState) => s.ui.deleteProductoId;

export default slice.reducer;
