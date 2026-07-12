import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { productApi } from "../../api/productApi";
import { categoryApi } from "../../api/categoryApi";
import type { Product, Category, ProductInput } from "../../types/index";
import Loader from "../../components/Loader";
import { getErrorMessage } from "../../utils/errorMessage";


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
      setProducts(prodRes.data.items);
      setCategories(catRes.data);
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
      // Comma-separated URLs for now — swap for real multipart upload once
      // your productController exposes an /upload endpoint (e.g. S3/Cloudinary).
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

  const handleDelete = async (id: string) => {
    try {
      await productApi.remove(id);
      toast.success("Product removed");
      load();
    } catch {
      toast.error("Could not remove product");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Products</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-black text-white px-3 py-1.5 rounded text-sm">
            Add Product
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded p-4 mb-6 flex flex-col gap-2">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <textarea
            required
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              required
              type="number"
              min={0}
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              required
              type="number"
              min={0}
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="border rounded px-3 py-2"
            />
          </div>
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <input
            placeholder="Image URLs, comma-separated"
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <div className="flex gap-2 mt-2">
            <button type="submit" className="bg-black text-white px-4 py-2 rounded">
              {editingId ? "Update" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="border px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {products.map((p) => (
          <div key={p._id} className="border rounded p-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={p.images?.[0]} alt={p.name} className="w-12 h-12 object-cover rounded" />
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-500">₹{p.price} · stock {p.stock}</p>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => handleEdit(p)} className="underline">Edit</button>
              <button onClick={() => handleDelete(p._id)} className="text-red-600 underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}