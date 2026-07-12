import { describe, it, expect } from "vitest";
import cartReducer, { addItem, removeItem, updateQty, applyCoupon, removeCoupon } from "../features/cart/cartSlice";

const initialState = { items: [], couponCode: null, discount: 0 };

describe("cartSlice", () => {
  it("adds a new item", () => {
    const state = cartReducer(initialState, addItem({ productId: "1", name: "Mouse", price: 100, qty: 1 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].qty).toBe(1);
  });

  it("increments qty when adding an existing item", () => {
    let state = cartReducer(initialState, addItem({ productId: "1", name: "Mouse", price: 100, qty: 1 }));
    state = cartReducer(state, addItem({ productId: "1", name: "Mouse", price: 100, qty: 2 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].qty).toBe(3);
  });

  it("removes an item", () => {
    let state = cartReducer(initialState, addItem({ productId: "1", name: "Mouse", price: 100, qty: 1 }));
    state = cartReducer(state, removeItem("1"));
    expect(state.items).toHaveLength(0);
  });

  it("updates quantity", () => {
    let state = cartReducer(initialState, addItem({ productId: "1", name: "Mouse", price: 100, qty: 1 }));
    state = cartReducer(state, updateQty({ productId: "1", qty: 5 }));
    expect(state.items[0].qty).toBe(5);
  });

  it("applies and removes a coupon", () => {
    let state = cartReducer(initialState, applyCoupon({ code: "SAVE10", discount: 50 }));
    expect(state.couponCode).toBe("SAVE10");
    expect(state.discount).toBe(50);
    state = cartReducer(state, removeCoupon());
    expect(state.couponCode).toBeNull();
    expect(state.discount).toBe(0);
  });
});