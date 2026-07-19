import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderApi } from "../../api/orderApi";
import type { Order, OrderStatus } from "../../types/index";

interface OrderState {
  myOrders: Order[];
  current: Order | null;
  allOrders: Order[]; // admin
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: OrderState = {
  myOrders: [],
  current: null,
  allOrders: [],
  status: "idle",
  error: null,
};

export const createOrder = createAsyncThunk(
  "orders/create",
  async (payload: { items: { product: string; quantity: number }[]; address: string; idempotencyKey: string; couponCode?: string }) => {
    const { data } = await orderApi.create(payload);
    return data.order;
  }
);

export const fetchMyOrders = createAsyncThunk("orders/fetchMine", async () => {
  const { data } = await orderApi.myOrders();
  return data.orders;
});

export const fetchOrderById = createAsyncThunk("orders/fetchOne", async (id: string) => {
  const { data } = await orderApi.getById(id);
  return data.order;
});

export const fetchAllOrders = createAsyncThunk(
  "orders/fetchAll",
  async (params: { status?: OrderStatus } | undefined) => {
    const { data } = await orderApi.all(params);
    return data.items;
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, status }: { id: string; status: OrderStatus }) => {
    const { data } = await orderApi.updateStatus(id, status);
    return data.order;
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load orders";
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.allOrders = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.allOrders.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) state.allOrders[idx] = action.payload;
        if (state.current?._id === action.payload._id) state.current = action.payload;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.myOrders.unshift(action.payload);
      });
  },
});

export default orderSlice.reducer;