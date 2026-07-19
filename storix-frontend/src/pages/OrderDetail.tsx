import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchOrderById } from "../features/orders/orderSlice";
import Loader from "../components/Loader";
import type { OrderStatus } from "../types";

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const order = useAppSelector((s) => s.orders.current);
  const status = useAppSelector((s) => s.orders.status);

  useEffect(() => {
    if (id) dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  if (status === "loading" || !order) return <Loader />;

  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);
  const isTerminalIssue = order.status === "cancelled" || order.status === "refunded";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="font-data text-sm text-slate mb-1">#{order._id.slice(-8).toUpperCase()}</p>
      <h1 className="font-display text-2xl font-bold mb-1">
        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </h1>
      <p className="text-slate text-sm mb-8">
        {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
      </p>

      {isTerminalIssue ? (
        <div className="bg-mist rounded-xl p-4 mb-8 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-danger" />
          <span className="font-medium capitalize">{order.status}</span>
        </div>
      ) : (
        <div className="mb-10">
          <div className="flex items-center">
            {STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    i <= currentStepIndex ? "bg-signal" : "bg-mist"
                  }`}
                />
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${i < currentStepIndex ? "bg-signal" : "bg-mist"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((step, i) => (
              <span
                key={step.key}
                className={`text-xs font-medium ${i <= currentStepIndex ? "text-ink" : "text-slate"}`}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-medium uppercase tracking-wide text-slate mb-3">Items</h2>
      <div className="border border-mist rounded-xl p-4 mb-6 font-data text-sm">
        {order.items.map((item, idx) => {
          const productName = typeof item.product === "string" ? "Product" : item.product.name;
          const key = typeof item.product === "string" ? item.product : item.product._id;
          return (
            <div key={key ?? idx} className="flex justify-between py-1.5">
              <span>{productName} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
            </div>
          );
        })}
        <div className="flex justify-between pt-2 mt-2 border-t border-mist font-medium text-base">
          <span>Total</span>
          <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <h2 className="text-sm font-medium uppercase tracking-wide text-slate mb-3">Delivery address</h2>
      <p className="text-sm text-slate leading-relaxed mb-6">
        {order.address?.addressLine1},{order.address?.addressLine2}, {order.address?.city}, {order.address?.state} – {order.address?.pincode}
      </p>

      <p className="text-sm">
        Payment: <span className="font-medium capitalize">{order.paymentStatus}</span>
      </p>
    </div>
  );
}