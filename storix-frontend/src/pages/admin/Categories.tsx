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

  const handleDelete = async (id: string) => {
    try {
      await categoryApi.remove(id);
      toast.success("Category removed");
      load();
    } catch {
      toast.error("Could not remove category");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Categories</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="flex flex-col gap-2">
        {categories.map((c) => (
          <div key={c._id} className="border rounded p-3 flex justify-between items-center">
            <span>{c.name}</span>
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => {
                  setEditingId(c._id);
                  setName(c.name);
                }}
                className="underline"
              >
                Edit
              </button>
              <button onClick={() => handleDelete(c._id)} className="text-red-600 underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}