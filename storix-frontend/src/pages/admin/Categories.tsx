import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { categoryApi } from "../../api/categoryApi";
import type { Category } from "../../types";
import Loader from "../../components/Loader";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await categoryApi.list();
      setCategories(data);
    } catch {
      toast.error("Could not load categories");
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
    if (!name.trim()) return;
    try {
      if (editingId) {
        await categoryApi.update(editingId, { name });
        toast.success("Category updated");
      } else {
        await categoryApi.create({ name });
        toast.success("Category created");
      }
      setName("");
      setEditingId(null);
      load();
    } catch {
      toast.error("Could not save category");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Categories</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border border-mist rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink"
        />
        <button type="submit" className="bg-ink text-white rounded-full px-5 py-2 text-sm hover:bg-signal transition-colors">
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => { setEditingId(null); setName(""); }}
            className="border border-mist rounded-full px-5 py-2 text-sm hover:border-slate"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="border border-mist rounded-xl divide-y divide-mist">
        {categories.map((c) => (
          <div key={c._id} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">{c.name}</span>
            <div className="flex gap-4 text-xs">
              <button onClick={() => { setEditingId(c._id); setName(c.name); }} className="text-slate hover:text-ink font-medium">
                Edit
              </button>
              <button
                onClick={async () => { await categoryApi.remove(c._id); toast.success("Removed"); load(); }}
                className="text-slate hover:text-danger font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-slate text-sm px-4 py-6">No categories yet.</p>}
      </div>
    </div>
  );
}