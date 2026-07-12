import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchAllOrders } from "../../features/orders/orderSlice";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { allOrders } = useAppSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchAllOrders(undefined));
  }, [dispatch]);

  const pendingCount = allOrders.filter((o) => o.status === "pending").length;
  const totalRevenue = allOrders
    .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((sum, o) => sum + o.total, 0);

  const cards = [
    { label: "Total Orders", value: allOrders.length, to: "/admin/orders" },
    { label: "Pending Orders", value: pendingCount, to: "/admin/orders" },
    { label: "Revenue", value: `₹${totalRevenue}`, to: "/admin/orders" },
  ];

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="border rounded-lg p-4 hover:shadow-sm">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/admin/products" className="border rounded-lg p-4 hover:shadow-sm">
          Manage Products →
        </Link>
        <Link to="/admin/categories" className="border rounded-lg p-4 hover:shadow-sm">
          Manage Categories →
        </Link>
        <Link to="/admin/orders" className="border rounded-lg p-4 hover:shadow-sm">
          Manage Orders →
        </Link>
        <Link to="/admin/coupons" className="border rounded-lg p-4 hover:shadow-sm">
          Manage Coupons →
        </Link>
      </div>
    </div>
  );
}