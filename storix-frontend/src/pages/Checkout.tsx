import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchAddresses } from "../features/address/addressSlice";
import { createOrder } from "../features/orders/orderSlice";
import { clearCart } from "../features/cart/cartSlice";
import Loader from "../components/Loader";
import { getErrorMessage } from "../utils/errorMessage";

// Razorpay injects this global once its checkout.js script is loaded
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
      toast.error("Select a delivery address");
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

      // Trigger Razorpay checkout widget — backend order.paymentOrderId comes from
      // Razorpay order creation done server-side in the order/webhook controller.
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: total * 100, // paise
        currency: "INR",
        name: "Storix",
        order_id: order.paymentOrderId,
        handler: () => {
          toast.success("Payment successful");
          dispatch(clearCart());
          navigate(`/orders/${order._id}`);
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Try again from Order History.");
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
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Add a delivery address before checking out.</p>
        <Link to="/addresses" className="underline">Add address</Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Checkout</h1>

      <h2 className="font-medium mb-2">Delivery Address</h2>
      <div className="flex flex-col gap-2 mb-6">
        {addresses.map((addr) => (
          <label
            key={addr._id}
            className={`border rounded p-3 flex items-start gap-2 cursor-pointer ${selectedAddressId === addr._id ? "border-black" : ""
              }`}
          >
            <input
              type="radio"
              name="address"
              checked={activeAddressId === addr._id}
              onChange={() => setSelectedAddressId(addr._id)}
            />
            <span className="text-sm">
              {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
              {addr.isDefault && <span className="ml-2 text-xs text-gray-500">(default)</span>}
            </span>
          </label>
        ))}
      </div>

      <h2 className="font-medium mb-2">Order Summary</h2>
      <div className="border rounded p-3 mb-6">
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between text-sm py-1">
            <span>{i.name} × {i.qty}</span>
            <span>₹{i.price * i.qty}</span>
          </div>
        ))}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 py-1">
            <span>Coupon ({couponCode})</span>
            <span>-₹{discount}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold border-t pt-2 mt-2">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={placing}
        className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
      >
        {placing ? "Placing order..." : `Pay ₹${total}`}
      </button>
    </div>
  );
}