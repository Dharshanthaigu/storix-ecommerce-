import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchAllOrders } from "../../features/orders/orderSlice";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { allOrders } = useAppSelector((s) => s.orders);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount, setState happens after await, not synchronously
    dispatch(fetchAllOrders(undefined));
  }, [dispatch]);

  const pendingCount = allOrders.filter((o) => o.status === "pending").length;
  const shippedCount = allOrders.filter((o) => o.status === "shipped").length;
  const revenue = allOrders
    .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const metrics = [
    { label: "Total orders", value: allOrders.length.toString() },
    { label: "Pending", value: pendingCount.toString(), flag: pendingCount > 0 },
    { label: "In transit", value: shippedCount.toString() },
    { label: "Revenue", value: `₹${revenue.toLocaleString("en-IN")}` },
  ];

  const sections = [
    { label: "Products", to: "/admin/products", desc: "Catalog, stock, images" },
    { label: "Categories", to: "/admin/categories", desc: "Taxonomy" },
    { label: "Orders", to: "/admin/orders", desc: "Fulfillment queue" },
    { label: "Coupons", to: "/admin/coupons", desc: "Discount codes" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-1">Control room</h1>
      <p className="text-slate text-sm mb-8">Live snapshot of the store.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {metrics.map((m) => (
          <div key={m.label} className="border border-mist rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-slate mb-1.5">{m.label}</p>
            <p className={`font-data text-2xl font-medium ${m.flag ? "text-warning" : ""}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sections.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="border border-mist rounded-xl p-5 hover:border-ink transition-colors"
          >
            <p className="font-medium mb-0.5">{s.label}</p>
            <p className="text-sm text-slate">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}