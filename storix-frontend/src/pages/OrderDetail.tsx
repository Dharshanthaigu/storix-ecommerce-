import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchOrderById } from "../features/orders/orderSlice";
import Loader from "../components/Loader";
import type { OrderStatus } from "../types";

const STEPS: OrderStatus[] = ["pending", "paid", "shipped", "delivered"];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const order = useAppSelector((s) => s.orders.current);
  const status = useAppSelector((s) => s.orders.status);

  useEffect(() => {
    if (id) dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  if (status === "loading" || !order) return <Loader />;

  const currentStepIndex = STEPS.indexOf(order.status);
  const isTerminalIssue = order.status === "cancelled" || order.status === "refunded";

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-1">Order #{order._id.slice(-8)}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Placed on {new Date(order.createdAt).toLocaleString()}
      </p>

      {isTerminalIssue ? (
        <p className="mb-6 font-medium text-red-600 capitalize">{order.status}</p>
      ) : (
        <div className="flex items-center mb-6">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`h-3 w-3 rounded-full ${
                  i <= currentStepIndex ? "bg-black" : "bg-gray-200"
                }`}
              />
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < currentStepIndex ? "bg-black" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      )}
      {!isTerminalIssue && (
        <div className="flex justify-between text-xs text-gray-500 mb-6 -mt-4">
          {STEPS.map((step) => (
            <span key={step} className="capitalize">{step}</span>
          ))}
        </div>
      )}

      <h2 className="font-medium mb-2">Items</h2>
      <div className="border rounded mb-4">
        {order.items.map((item) => (
          <div key={item.productId} className="flex justify-between px-3 py-2 border-b last:border-b-0 text-sm">
            <span>{item.name} × {item.qty}</span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}
        <div className="flex justify-between px-3 py-2 font-semibold">
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>
      </div>

      <h2 className="font-medium mb-2">Delivery Address</h2>
      <p className="text-sm text-gray-600 mb-4">
        {order.address?.line1}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
      </p>

      <p className="text-sm">
        Payment status: <span className="font-medium capitalize">{order.paymentStatus}</span>
      </p>
    </div>
  );
}