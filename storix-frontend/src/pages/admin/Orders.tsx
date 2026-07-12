import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchAllOrders, updateOrderStatus } from "../../features/orders/orderSlice";
import Loader from "../../components/Loader";
import type { OrderStatus } from "../../types";

// Mirrors the state machine enforced server-side in orderController —
// this is just the allowed next-step UI list, backend still validates transitions.
const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export default function AdminOrders() {
  const dispatch = useAppDispatch();
  const { allOrders, status } = useAppSelector((s) => s.orders);
  const [filter, setFilter] = useState<OrderStatus | "">("");

  useEffect(() => {
    dispatch(fetchAllOrders(filter ? { status: filter } : undefined));
  }, [dispatch, filter]);

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      await dispatch(updateOrderStatus({ id, status: newStatus })).unwrap();
      toast.success(`Order marked as ${newStatus}`);
    } catch {
      toast.error("Could not update order status");
    }
  };

  if (status === "loading") return <Loader />;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Orders</h1>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as OrderStatus | "")}
        className="border rounded px-2 py-1 mb-4"
      >
        <option value="">All statuses</option>
        {(["pending", "paid", "shipped", "delivered", "cancelled", "refunded"] as OrderStatus[]).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="flex flex-col gap-2">
        {allOrders.map((order) => (
          <div key={order._id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <p className="font-medium">#{order._id.slice(-8)}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()} · ₹{order.total}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm capitalize">{order.status}</span>
              {NEXT_STATUS[order.status].length > 0 && (
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) handleStatusChange(order._id, e.target.value as OrderStatus);
                  }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="" disabled>Update status</option>
                  {NEXT_STATUS[order.status].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}
        {allOrders.length === 0 && <p className="text-gray-500 text-sm">No orders found.</p>}
      </div>
    </div>
  );
}