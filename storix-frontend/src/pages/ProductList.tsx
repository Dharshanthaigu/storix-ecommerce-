import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchProducts } from "../features/products/productSlice";
import { categoryApi } from "../api/categoryApi";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import type { Category } from "../types/index"

export default function ProductList() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.products);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("");

  useEffect(() => {
    categoryApi.list().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    dispatch(fetchProducts(category ? { category } : undefined));
  }, [dispatch, category]);

  if (status === "loading") return <Loader />;
  if (status === "failed") return <p className="text-red-600 p-4">{error}</p>;

  return (
    <div className="p-4">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="mb-4 border rounded px-2 py-1"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      {items.length === 0 && <p className="text-gray-500 mt-8 text-center">No products found.</p>}
    </div>
  );
}