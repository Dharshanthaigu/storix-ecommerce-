import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { couponApi } from "../../api/couponApi";
import type { Coupon } from "../../types";
import Loader from "../../components/Loader";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [expiresAt, setExpiresAt] = useState("");


  const load = async () => {
    setLoading(true);
    try {
      const { data } = await couponApi.list();
      setCoupons(data.coupons);
    } catch {
      toast.error("Could not load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount, setState happens after await, not synchronously
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expiresAt) {
      toast.error("Please select an expiry date");
      return;
    }

    const selectedDate = new Date(expiresAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ignore time, compare just the date

    if (selectedDate < today) {
      toast.error("Expiry date cannot be in the past");
      return;
    }

    try {
      await couponApi.create({
        code: code.trim().toUpperCase(),
        discountType: "percentage",
        discountValue: Number(discountPercent),
        expiresAt: new Date(expiresAt).toISOString(),
      });
      toast.success("Coupon created");
    } catch (err) {
      // your existing error handling
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Coupons</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          placeholder="CODE"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 border border-mist rounded-lg px-3 py-2 text-sm font-data uppercase focus:outline-none focus:border-ink"
        />
        <input
          type="number"
          min={1}
          max={100}
          placeholder="% off"
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          className="w-24 border border-mist rounded-lg px-3 py-2 text-sm font-data focus:outline-none focus:border-ink"
        />
        <input
          type="date"
          value={expiresAt}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="border border-mist rounded-lg px-3 py-2 text-sm font-data focus:outline-none focus:border-ink"
        />
        <button type="submit" className="bg-ink text-white rounded-full px-5 py-2 text-sm hover:bg-signal transition-colors">
          Create
        </button>
      </form>

      <div className="border border-mist rounded-xl divide-y divide-mist">
        {coupons.map((c) => (
          <div key={c._id} className="flex items-center justify-between px-4 py-3">
            <span className="font-data font-medium">{c.code}</span>
            <span className="text-xs text-slate">
              {c.discountValue}{c.discountType === "percentage" ? "%" : ""} off · used {c.usedCount}×
            </span>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-slate text-sm px-4 py-6">No coupons yet.</p>}
      </div>
    </div>
  );
}