import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { removeItem, updateQty, applyCoupon, removeCoupon } from "../features/cart/cartSlice";
import { couponApi } from "../api/couponApi";

export default function Cart() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, couponCode, discount } = useAppSelector((s) => s.cart);
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = Math.max(subtotal - discount, 0);

  const handleApplyCoupon = async () => {
    if (!code.trim()) return;
    setApplying(true);
    try {
      const { data } = await couponApi.apply(code.trim(), subtotal);
      dispatch(applyCoupon({ code: data.code, discount: subtotal - data.newTotal }));
      toast.success(`Coupon applied — you saved ₹${subtotal - data.newTotal}`);
    } catch {
      toast.error("That code didn't work. Check it and try again.");
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="font-display text-2xl mb-2">Your cart is empty</p>
        <p className="text-slate mb-6">Add something from the catalog to get started.</p>
        <Link to="/" className="text-signal font-medium hover:underline">
          Browse products →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Your cart</h1>

      <div className="border-t border-mist">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 py-5 border-b border-mist">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="font-data text-sm text-slate mt-0.5">₹{item.price.toLocaleString("en-IN")} each</p>
            </div>
            <div className="flex items-center border border-mist rounded-full">
              <button
                onClick={() => dispatch(updateQty({ productId: item.productId, qty: Math.max(1, item.qty - 1) }))}
                className="w-8 h-8 flex items-center justify-center text-slate hover:text-ink"
              >
                −
              </button>
              <span className="font-data w-8 text-center text-sm">{item.qty}</span>
              <button
                onClick={() => dispatch(updateQty({ productId: item.productId, qty: item.qty + 1 }))}
                className="w-8 h-8 flex items-center justify-center text-slate hover:text-ink"
              >
                +
              </button>
            </div>
            <span className="font-data font-medium w-20 text-right">
              ₹{(item.price * item.qty).toLocaleString("en-IN")}
            </span>
            <button
              onClick={() => dispatch(removeItem(item.productId))}
              className="text-slate hover:text-danger text-sm"
              aria-label={`Remove ${item.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        {couponCode ? (
          <div className="flex items-center justify-between text-sm bg-mist rounded-lg px-4 py-3 mb-4">
            <span>
              Code <span className="font-data font-medium">{couponCode}</span> applied
            </span>
            <button onClick={() => dispatch(removeCoupon())} className="text-slate hover:text-danger">
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2 mb-6">
            <input
              placeholder="Discount code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 border border-mist rounded-full px-4 py-2 text-sm focus:outline-none focus:border-ink"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={applying}
              className="text-sm border border-ink rounded-full px-5 py-2 hover:bg-ink hover:text-white transition-colors disabled:opacity-50"
            >
              {applying ? "Applying…" : "Apply"}
            </button>
          </div>
        )}

        <div className="space-y-1.5 font-data text-sm">
          <div className="flex justify-between text-slate">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>−₹{discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-medium pt-2 border-t border-mist">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          className="w-full mt-6 bg-ink text-white rounded-full py-3.5 font-medium hover:bg-signal transition-colors"
        >
          Continue to checkout
        </button>
      </div>
    </div>
  );
}