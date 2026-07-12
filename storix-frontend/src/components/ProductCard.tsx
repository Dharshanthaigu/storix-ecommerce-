import { Link } from "react-router-dom";
import type { Product } from "../types";
import StatusRail from "./StatusRail";

export default function ProductCard({ product }: { product: Product }) {
  const stockStatus =
    product.stock === 0 ? "out-of-stock" : product.stock <= 5 ? "low-stock" : "in-stock";

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="aspect-square rounded-lg overflow-hidden bg-mist mb-3">
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <StatusRail status={stockStatus}>
        <p className="text-xs text-slate uppercase tracking-wide mb-0.5">{product.category?.name}</p>
        <h3 className="font-medium leading-snug">{product.name}</h3>
        <div className="flex items-baseline justify-between mt-1">
          <span className="font-data text-lg font-medium">₹{product.price.toLocaleString("en-IN")}</span>
          {product.stock === 0 && (
            <span className="text-xs text-danger font-medium">Out of stock</span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="text-xs text-warning font-medium">{product.stock} left</span>
          )}
        </div>
      </StatusRail>
    </Link>
  );
}