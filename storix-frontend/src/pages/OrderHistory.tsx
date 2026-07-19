import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchMyOrders } from "../features/orders/orderSlice";
import Loader from "../components/Loader";
import StatusRail from "../components/StatusRail";

export default function OrderHistory() {
  const dispatch = useAppDispatch();
  const { myOrders, status } = useAppSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  if (status === "loading") return <Loader />;

  if (myOrders.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="font-display text-2xl mb-2">No orders yet</p>
        <p className="text-slate mb-6">Everything you buy will show up here.</p>
        <Link to="/" className="text-signal font-medium hover:underline">
          Start shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Your orders</h1>

      <div className="flex flex-col gap-3">
        {myOrders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="block border border-mist rounded-xl p-4 hover:border-slate transition-colors"
          >
            <StatusRail status={order.status}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-data text-sm text-slate">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-slate mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-data font-medium">₹{order.totalAmount.toLocaleString("en-IN")}</p>
                  <p className="text-xs capitalize text-slate mt-0.5">{order.status}</p>
                </div>
              </div>
            </StatusRail>
          </Link>
        ))}
      </div>
    </div>
  );
}