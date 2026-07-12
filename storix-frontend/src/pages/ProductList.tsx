import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchProducts } from "../features/products/productSlice";
import { categoryApi } from "../api/categoryApi";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import type { Category } from "../types";

export default function ProductList() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((s) => s.products);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("");

  useEffect(() => {
    categoryApi.list().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    dispatch(fetchProducts(category ? { category } : undefined));
  }, [dispatch, category]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Catalog</h1>
          <p className="text-slate text-sm mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCategory("")}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors ${
              category === "" ? "bg-ink text-white border-ink" : "border-mist text-slate hover:border-ink"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setCategory(c._id)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors ${
                category === c._id ? "bg-ink text-white border-ink" : "border-mist text-slate hover:border-ink"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {status === "loading" && <Loader />}

      {status === "succeeded" && items.length === 0 && (
        <div className="text-center py-24">
          <p className="font-display text-xl mb-1">Nothing here yet</p>
          <p className="text-slate text-sm">Try a different category, or check back soon.</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}