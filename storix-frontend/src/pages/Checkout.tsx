import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchAddresses } from "../features/address/addressSlice";
import { createOrder } from "../features/orders/orderSlice";
import { clearCart } from "../features/cart/cartSlice";
import { getErrorMessage } from "../utils/errorMessage";
import Loader from "../components/Loader";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void; on: (event: string, cb: () => void) => void };
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  handler: () => void;
  prefill: { name?: string; email?: string };
  theme: { color: string };
}

export default function Checkout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, couponCode, discount } = useAppSelector((s) => s.cart);
  const { items: addresses, status: addrStatus } = useAppSelector((s) => s.address);
  const user = useAppSelector((s) => s.auth.user);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const activeAddressId =
    selectedAddressId ?? addresses.find((a) => a.isDefault)?._id ?? addresses[0]?._id ?? "";

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = Math.max(subtotal - discount, 0);

  const handlePlaceOrder = async () => {
    if (!activeAddressId) {
      toast.error("Select a delivery address to continue");
      return;
    }
    setPlacing(true);
    try {
      const order = await dispatch(
        createOrder({
          items: items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty })),
          addressId: activeAddressId,
          couponCode: couponCode ?? undefined,
        })
      ).unwrap();

      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: "INR",
        name: "Storix",
        order_id: order.paymentOrderId,
        handler: () => {
          toast.success("Payment received — order placed");
          dispatch(clearCart());
          navigate(`/orders/${order._id}`);
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#14161A" },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed — you can retry from Order History");
        navigate(`/orders/${order._id}`);
      });
      rzp.open();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Could not place order"));
    } finally {
      setPlacing(false);
    }
  };

  if (addrStatus === "loading") return <Loader />;

  if (addresses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="font-display text-2xl mb-2">Add a delivery address</p>
        <p className="text-slate mb-6">You'll need one before checking out.</p>
        <Link to="/addresses" className="text-signal font-medium hover:underline">
          Add address →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      <h2 className="text-sm font-medium uppercase tracking-wide text-slate mb-3">Deliver to</h2>
      <div className="grid gap-2 mb-8">
        {addresses.map((addr) => (
          <label
            key={addr._id}
            className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-colors ${
              activeAddressId === addr._id ? "border-ink bg-mist" : "border-mist hover:border-slate"
            }`}
          >
            <input
              type="radio"
              name="address"
              className="mt-1 accent-ink"
              checked={activeAddressId === addr._id}
              onChange={() => setSelectedAddressId(addr._id)}
            />
            <span className="text-sm leading-relaxed">
              {addr.line1}, {addr.city}, {addr.state} – {addr.pincode}
              {addr.isDefault && <span className="ml-2 text-xs text-slate">Default</span>}
            </span>
          </label>
        ))}
      </div>

      <h2 className="text-sm font-medium uppercase tracking-wide text-slate mb-3">Order summary</h2>
      <div className="border border-mist rounded-xl p-4 mb-8 font-data text-sm">
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between py-1">
            <span>{i.name} × {i.qty}</span>
            <span>₹{(i.price * i.qty).toLocaleString("en-IN")}</span>
          </div>
        ))}
        {discount > 0 && (
          <div className="flex justify-between py-1 text-success">
            <span>Coupon ({couponCode})</span>
            <span>−₹{discount.toLocaleString("en-IN")}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 mt-2 border-t border-mist font-medium text-base">
          <span>Total</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={placing}
        className="w-full bg-ink text-white rounded-full py-3.5 font-medium hover:bg-signal transition-colors disabled:opacity-50"
      >
        {placing ? "Placing order…" : `Pay ₹${total.toLocaleString("en-IN")}`}
      </button>
    </div>
  );
}