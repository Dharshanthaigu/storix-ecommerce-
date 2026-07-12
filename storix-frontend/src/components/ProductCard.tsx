import { Link } from "react-router-dom";
import type { Product } from "../types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="block rounded-lg border p-3 hover:shadow-md transition"
    >
      <img
        src={product.images?.[0]}
        alt={product.name}
        className="w-full h-48 object-cover rounded-md mb-2"
        loading="lazy"
      />
      <h3 className="font-medium truncate">{product.name}</h3>
      <p className="text-sm text-gray-500">{product.category?.name}</p>
      <p className="font-semibold mt-1">₹{product.price}</p>
      {product.stock === 0 && <span className="text-xs text-red-600">Out of stock</span>}
    </Link>
  );
}