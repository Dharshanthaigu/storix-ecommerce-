import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "../../types/index";

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
}

const initialState: CartState = { items: [], couponCode: null, discount: 0 };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) existing.qty += action.payload.qty;
      else state.items.push(action.payload);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    updateQty: (state, action: PayloadAction<{ productId: string; qty: number }>) => {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) item.qty = action.payload.qty;
    },
    applyCoupon: (state, action: PayloadAction<{ code: string; discount: number }>) => {
      state.couponCode = action.payload.code;
      state.discount = action.payload.discount;
    },
    removeCoupon: (state) => {
      state.couponCode = null;
      state.discount = 0;
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = null;
      state.discount = 0;
    },
  },
});

export const { addItem, removeItem, updateQty, applyCoupon, removeCoupon, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;