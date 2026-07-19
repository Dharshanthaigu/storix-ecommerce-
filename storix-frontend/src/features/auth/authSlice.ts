import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../../api/authApi";
import type { User } from "../../types/index";
import { getErrorMessage } from "../../utils/errorMessage";

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Decode a JWT payload without a library — just base64-decode the middle segment.
function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

function loadPersistedAuth(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    if (!token || !userRaw) return { user: null, token: null };

    const exp = decodeJwtExp(token);
    if (!exp || Date.now() >= exp * 1000) {
      // expired or malformed — clear it out
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return { user: null, token: null };
    }

    return { user: JSON.parse(userRaw) as User, token };
  } catch {
    return { user: null, token: null };
  }
}

const persisted = loadPersistedAuth();

const initialState: AuthState = {
  user: persisted.user,
  token: persisted.token,
  status: "idle",
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(payload);
      return data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Login failed"));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: { name: string; email: string; password: string; phone: string }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.register(payload);
      return data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Registration failed"));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.status = "succeeded";
        void action;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer; 