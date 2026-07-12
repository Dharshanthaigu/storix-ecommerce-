import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchMyOrders } from "../features/orders/orderSlice";
import Loader from "../components/Loader";

const statusColor: Record<string, string> = {
  pending: "text-yellow-600",
  paid: "text-blue-600",
  shipped: "text-purple-600",
  delivered: "text-green-600",
  cancelled: "text-red-600",
  refunded: "text-gray-500",
};

export default function OrderHistory() {
  const dispatch = useAppDispatch();
  const { myOrders, status } = useAppSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  if (status === "loading") return <Loader />;

  if (myOrders.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">No orders yet.</p>
        <Link to="/" className="underline">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">My Orders</h1>
      <div className="flex flex-col gap-3">
        {myOrders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="border rounded p-4 flex justify-between items-center hover:shadow-sm"
          >
            <div>
              <p className="font-medium">Order #{order._id.slice(-8)}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">₹{order.total}</p>
              <p className={`text-sm capitalize ${statusColor[order.status] ?? ""}`}>{order.status}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}