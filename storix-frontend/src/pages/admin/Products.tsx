import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { productApi } from "../../api/productApi";
import { categoryApi } from "../../api/categoryApi";
import type { Product, Category, ProductInput } from "../../types";
import { getErrorMessage } from "../../utils/errorMessage";
import Loader from "../../components/Loader";
import StatusRail from "../../components/StatusRail";

const emptyForm = { name: "", description: "", price: "", stock: "", category: "", images: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([productApi.list(), categoryApi.list()]);
      setProducts(prodRes.data.products);
      setCategories(catRes.data.category);
    } catch {
      toast.error("Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount, setState happens after await, not synchronously
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload: ProductInput = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await productApi.update(editingId, payload);
        toast.success("Product updated");
      } else {
        await productApi.create(payload);
        toast.success("Product created");
      }
      resetForm();
      load();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Could not save product"));
    }
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      category: p.category._id,
      images: p.images.join(", "),
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Products</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="text-sm bg-ink text-white rounded-full px-4 py-2 hover:bg-signal transition-colors">
            Add product
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-mist rounded-xl p-5 mb-8 grid gap-3">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-mist rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink" />
          <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-mist rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink" />
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" min={0} placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border border-mist rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink font-data" />
            <input required type="number" min={0} placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border border-mist rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink font-data" />
          </div>
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-mist rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink">
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input placeholder="Image URLs, comma-separated" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="border border-mist rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink" />
          <div className="flex gap-2 mt-1">
            <button type="submit" className="bg-ink text-white rounded-full px-5 py-2 text-sm hover:bg-signal transition-colors">
              {editingId ? "Update" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="border border-mist rounded-full px-5 py-2 text-sm hover:border-slate">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="border border-mist rounded-xl divide-y divide-mist">
        {products.map((p) => {
          const stockStatus = p.stock === 0 ? "out-of-stock" : p.stock <= 5 ? "low-stock" : "in-stock";
          return (
            <div key={p._id} className="px-4 py-3">
              <StatusRail status={stockStatus}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="font-data text-xs text-slate">₹{p.price.toLocaleString("en-IN")} · {p.stock} in stock</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs shrink-0">
                    <button onClick={() => handleEdit(p)} className="text-slate hover:text-ink font-medium">Edit</button>
                    <button
                      onClick={async () => { await productApi.remove(p._id); toast.success("Removed"); load(); }}
                      className="text-slate hover:text-danger font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </StatusRail>
            </div>
          );
        })}
      </div>
    </div>
  );
}