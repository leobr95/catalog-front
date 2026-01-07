import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import categoriasReducer from "./slices/categoriasSlice";
import productosReducer from "./slices/productosSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    categorias: categoriasReducer,
    productos: productosReducer,
  },
});

store.subscribe(() => {
  if (typeof window === "undefined") return;
  const s = store.getState();

  try {
    localStorage.setItem("ui", JSON.stringify({ lang: s.ui.lang, theme: s.ui.theme }));
    localStorage.setItem(
      "auth",
      JSON.stringify({
        token: s.auth.token,
        expiresAt: s.auth.expiresAt,
        refreshToken: s.auth.refreshToken,
        refreshExpiresAt: s.auth.refreshExpiresAt,
        user: s.auth.user,
      })
    );
  } catch {
    // ignore
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
