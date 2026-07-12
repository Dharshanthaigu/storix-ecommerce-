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

const initialState: AuthState = { user: null, token: null, status: "idle", error: null };

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(payload);
      return data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Login failed")); // or "Registration failed" in the register thunk
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: { name: string; email: string; password: string }, { rejectWithValue }) => {
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
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;