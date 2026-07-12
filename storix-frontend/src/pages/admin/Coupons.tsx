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

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await couponApi.list();
      setCoupons(data);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountPercent) return;
    try {
      await couponApi.create({ code: code.trim().toUpperCase(), discountPercent: Number(discountPercent) });
      toast.success("Coupon created");
      setCode("");
      setDiscountPercent("");
      load();
    } catch {
      toast.error("Could not create coupon");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Coupons</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          placeholder="CODE"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          type="number"
          min={1}
          max={100}
          placeholder="% off"
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          className="border rounded px-3 py-2 w-24"
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">Create</button>
      </form>

      <div className="flex flex-col gap-2">
        {coupons.map((c) => (
          <div key={c._id} className="border rounded p-3 flex justify-between">
            <span className="font-mono">{c.code}</span>
            <span className="text-sm text-gray-500">{c.discountPercent}% off · used {c.usageCount}×</span>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-gray-500 text-sm">No coupons yet.</p>}
      </div>
    </div>
  );
}