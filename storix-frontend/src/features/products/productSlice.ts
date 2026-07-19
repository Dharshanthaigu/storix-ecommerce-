import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productApi } from "../../api/productApi";
import type { Product } from "../../types/index";

interface ProductState {
  items: Product[];
  current: Product | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProductState = { items: [], current: null, status: "idle", error: null };

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (params: { category?: string } | undefined) => {
    const { data } = await productApi.list(params);
    return data;
  }
);

export const fetchProductById = createAsyncThunk("products/fetchOne", async (id: string) => {
  const { data } = await productApi.getById(id);
  return data;
});

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.products;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load products";
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.current = action.payload.product;
      });
  },
});

export default productSlice.reducer;