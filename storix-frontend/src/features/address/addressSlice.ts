import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addressApi } from "../../api/addressApi";
import type { Address } from "../../types/index";

interface AddressState {
  items: Address[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AddressState = { items: [], status: "idle", error: null };

export const fetchAddresses = createAsyncThunk("address/fetchAll", async () => {
  const { data } = await addressApi.list();
  return data.address;
});

export const createAddress = createAsyncThunk(
  "address/create",
  async (payload: Omit<Address, "_id" | "isDefault">) => {
    const { data } = await addressApi.create(payload);
    return data.address;
  }
);

export const updateAddress = createAsyncThunk(
  "address/update",
  async ({ id, data }: { id: string; data: Partial<Address> }) => {
    const res = await addressApi.update(id, data);
    return res.data.address;
  }
);

export const removeAddress = createAsyncThunk("address/remove", async (id: string) => {
  await addressApi.remove(id);
  return id;
});

export const setDefaultAddress = createAsyncThunk("address/setDefault", async (id: string) => {
  const { data } = await addressApi.setDefault(id);
  return data.address;
});

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load addresses";
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(removeAddress.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a._id !== action.payload);
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.items = state.items.map((a) => ({
          ...a,
          isDefault: a._id === action.payload._id,
        }));
      });
  },  
});

export default addressSlice.reducer;