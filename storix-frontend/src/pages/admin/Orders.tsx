import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchAllOrders, updateOrderStatus } from "../../features/orders/orderSlice";
import Loader from "../../components/Loader";
import StatusRail from "../../components/StatusRail";
import type { OrderStatus } from "../../types";

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
      toast.success(`Marked as ${newStatus}`);
    } catch {
      toast.error("Could not update status");
    }
  };

  if (status === "loading") return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as OrderStatus | "")}
          className="border border-mist rounded-full px-4 py-2 text-sm focus:outline-none focus:border-ink"
        >
          <option value="">All statuses</option>
          {(["pending", "paid", "shipped", "delivered", "cancelled", "refunded"] as OrderStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="border border-mist rounded-xl divide-y divide-mist">
        {allOrders.map((order) => (
          <div key={order._id} className="px-4 py-3">
            <StatusRail status={order.status}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-data text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-slate">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")} · ₹{order.total.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs capitalize font-medium">{order.status}</span>
                  {NEXT_STATUS[order.status].length > 0 && (
                    <select
                      defaultValue=""
                      onChange={(e) => e.target.value && handleStatusChange(order._id, e.target.value as OrderStatus)}
                      className="border border-mist rounded-full px-3 py-1 text-xs focus:outline-none focus:border-ink"
                    >
                      <option value="" disabled>Update →</option>
                      {NEXT_STATUS[order.status].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                </div>
              </div>
            </StatusRail>
          </div>
        ))}
        {allOrders.length === 0 && <p className="text-slate text-sm px-4 py-6">No orders found.</p>}
      </div>
    </div>
  );
}