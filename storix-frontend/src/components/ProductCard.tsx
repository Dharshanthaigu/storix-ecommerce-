import { Link } from "react-router-dom";
import type { Product } from "../types";
import StatusRail from "./StatusRail";

export default function ProductCard({ product }: { product: Product }) {
  const stockStatus =
    product.stock === 0 ? "out-of-stock" : product.stock <= 5 ? "low-stock" : "in-stock";

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="aspect-square rounded-lg overflow-hidden bg-mist mb-3 relative">
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isFeatured && (
          <span className="absolute top-2 left-2 bg-signal text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
        {discountPercent && (
          <span className="absolute top-2 right-2 bg-success text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            {discountPercent}% off
          </span>
        )}
      </div>
      <StatusRail status={stockStatus}>
        <p className="text-xs text-slate uppercase tracking-wide mb-0.5">{product.category?.name}</p>
        {product.brand && (
          <p className="text-xs text-slate mb-0.5">{product.brand}</p>
        )}
        <h3 className="font-medium leading-snug">{product.name}</h3>

        {product.rating !== undefined && product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className="text-warning">★</span>
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            {product.reviewCount !== undefined && (
              <span className="text-slate">({product.reviewCount.toLocaleString("en-IN")})</span>
            )}
          </div>
        )}

        <div className="flex items-baseline justify-between mt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-data text-lg font-medium">₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-data text-xs text-slate line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
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