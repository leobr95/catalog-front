import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { request } from "@/app/lib/api";

type UserDto = {
  userId: string;
  email: string;
  fullName: string;
  role: string;
};

type AuthResponse = {
  accessToken: string;
  expiresAt: string; // ISO string
  refreshToken: string;
  refreshExpiresAt: string; // ISO string
  user: UserDto;
};

type LoginRequest = { email: string; password: string };
type RegisterRequest = { email: string; password: string; fullName: string };

type AuthState = {
  token: string | null; // accessToken
  expiresAt: string | null;
  refreshToken: string | null;
  refreshExpiresAt: string | null;
  user: UserDto | null;
  loading: boolean;
};

const AUTH_STORAGE_KEY = "auth";
const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ?? "http://localhost:5267";

/** Guardar en localStorage (solo browser) */
function persistAuth(state: AuthState): void {
  if (typeof window === "undefined") return;
  try {
    const toSave: AuthState = {
      token: state.token,
      expiresAt: state.expiresAt,
      refreshToken: state.refreshToken,
      refreshExpiresAt: state.refreshExpiresAt,
      user: state.user,
      loading: false, // no guardamos loading
    };
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

/** Leer desde localStorage (solo browser) */
function safeParseAuth(raw: string | null): Partial<AuthState> | null {
  if (!raw) return null;
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v === null) return null;

    const rec = v as Record<string, unknown>;
    const out: Partial<AuthState> = {};

    if (typeof rec.token === "string" || rec.token === null) out.token = rec.token as string | null;
    if (typeof rec.expiresAt === "string" || rec.expiresAt === null) out.expiresAt = rec.expiresAt as string | null;

    if (typeof rec.refreshToken === "string" || rec.refreshToken === null)
      out.refreshToken = rec.refreshToken as string | null;

    if (typeof rec.refreshExpiresAt === "string" || rec.refreshExpiresAt === null)
      out.refreshExpiresAt = rec.refreshExpiresAt as string | null;

    const u = rec.user;
    if (typeof u === "object" && u !== null) {
      const ur = u as Record<string, unknown>;
      if (
        typeof ur.userId === "string" &&
        typeof ur.email === "string" &&
        typeof ur.fullName === "string" &&
        typeof ur.role === "string"
      ) {
        out.user = {
          userId: ur.userId,
          email: ur.email,
          fullName: ur.fullName,
          role: ur.role,
        };
      }
    } else if (u === null) {
      out.user = null;
    }

    return out;
  } catch {
    return null;
  }
}

/** initialState hidratado desde storage (si existe) */
function buildInitialState(): AuthState {
  const base: AuthState = {
    token: null,
    expiresAt: null,
    refreshToken: null,
    refreshExpiresAt: null,
    user: null,
    loading: false,
  };

  if (typeof window === "undefined") return base;

  const s = safeParseAuth(window.localStorage.getItem(AUTH_STORAGE_KEY));
  if (!s) return base;

  return {
    ...base,
    token: s.token ?? base.token,
    expiresAt: s.expiresAt ?? base.expiresAt,
    refreshToken: s.refreshToken ?? base.refreshToken,
    refreshExpiresAt: s.refreshExpiresAt ?? base.refreshExpiresAt,
    user: s.user ?? base.user,
  };
}

export const loginThunk = createAsyncThunk<AuthResponse, LoginRequest>("auth/login", async (dto) => {
  return await request<AuthResponse>("/api/Auth/login", {
    baseUrl: AUTH_BASE,
    method: "POST",
    body: JSON.stringify(dto),
  });
});

export const registerThunk = createAsyncThunk<AuthResponse, RegisterRequest>("auth/register", async (dto) => {
  return await request<AuthResponse>("/api/Auth/register", {
    baseUrl: AUTH_BASE,
    method: "POST",
    body: JSON.stringify(dto),
  });
});

export const meThunk = createAsyncThunk<UserDto, void, { state: RootState }>("auth/me", async (_, thunkApi) => {
  const token = thunkApi.getState().auth.token;
  if (!token) throw new Error("Missing token");

  return await request<UserDto>("/api/Auth/me", {
    baseUrl: AUTH_BASE,
    method: "GET",
    token,
  });
});

const slice = createSlice({
  name: "auth",
  initialState: buildInitialState(),
  reducers: {
    hydrate(state, action: PayloadAction<Partial<AuthState>>) {
      state.token = action.payload.token ?? state.token;
      state.expiresAt = action.payload.expiresAt ?? state.expiresAt;
      state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
      state.refreshExpiresAt = action.payload.refreshExpiresAt ?? state.refreshExpiresAt;
      state.user = action.payload.user ?? state.user;

      persistAuth(state);
    },

    /** opcional: si algún día quieres forzar re-lectura manual */
    hydrateFromStorage(state) {
      if (typeof window === "undefined") return;
      const s = safeParseAuth(window.localStorage.getItem(AUTH_STORAGE_KEY));
      if (!s) return;

      state.token = s.token ?? state.token;
      state.expiresAt = s.expiresAt ?? state.expiresAt;
      state.refreshToken = s.refreshToken ?? state.refreshToken;
      state.refreshExpiresAt = s.refreshExpiresAt ?? state.refreshExpiresAt;
      state.user = s.user ?? state.user;

      persistAuth(state);
    },

    logout(state) {
      state.token = null;
      state.expiresAt = null;
      state.refreshToken = null;
      state.refreshExpiresAt = null;
      state.user = null;

      if (typeof window !== "undefined") window.localStorage.removeItem(AUTH_STORAGE_KEY);
    },
  },
  extraReducers: (b) => {
    b.addCase(loginThunk.pending, (s) => {
      s.loading = true;
    });
    b.addCase(loginThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.token = a.payload.accessToken;
      s.expiresAt = a.payload.expiresAt;
      s.refreshToken = a.payload.refreshToken;
      s.refreshExpiresAt = a.payload.refreshExpiresAt;
      s.user = a.payload.user;

      persistAuth(s);
    });
    b.addCase(loginThunk.rejected, (s) => {
      s.loading = false;
    });

    b.addCase(registerThunk.pending, (s) => {
      s.loading = true;
    });
    b.addCase(registerThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.token = a.payload.accessToken;
      s.expiresAt = a.payload.expiresAt;
      s.refreshToken = a.payload.refreshToken;
      s.refreshExpiresAt = a.payload.refreshExpiresAt;
      s.user = a.payload.user;

      persistAuth(s);
    });
    b.addCase(registerThunk.rejected, (s) => {
      s.loading = false;
    });

    b.addCase(meThunk.fulfilled, (s, a) => {
      s.user = a.payload;
      persistAuth(s);
    });
  },
});

export const authActions = slice.actions;

export const selectToken = (s: RootState) => s.auth.token;
export const selectAuthLoading = (s: RootState) => s.auth.loading;
export const selectAuthUser = (s: RootState) => s.auth.user;

export default slice.reducer;
