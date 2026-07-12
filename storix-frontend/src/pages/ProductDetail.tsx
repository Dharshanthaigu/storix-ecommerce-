import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchProductById } from "../features/products/productSlice";
import { addItem } from "../features/cart/cartSlice";
import ImageCarousel from "../components/ImageCarousel";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const product = useAppSelector((s) => s.products.current);
  const status = useAppSelector((s) => s.products.status);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [dispatch, id]);

  if (status === "loading" || !product) return <Loader />;

  const stockLabel =
    product.stock === 0
      ? { text: "Out of stock", color: "text-danger" }
      : product.stock <= 5
      ? { text: `Only ${product.stock} left`, color: "text-warning" }
      : { text: "In stock", color: "text-success" };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-12">
      <ImageCarousel images={product.images} />

      <div className="md:sticky md:top-24 h-fit">
        <p className="text-xs text-slate uppercase tracking-wide mb-2">{product.category?.name}</p>
        <h1 className="font-display text-3xl font-bold leading-tight mb-3">{product.name}</h1>

        <div className="flex items-baseline gap-3 mb-6">
          <span className="font-data text-2xl font-medium">₹{product.price.toLocaleString("en-IN")}</span>
          <span className={`text-sm font-medium ${stockLabel.color}`}>{stockLabel.text}</span>
        </div>

        <p className="text-slate leading-relaxed mb-8">{product.description}</p>

        <button
          disabled={product.stock === 0}
          onClick={() => {
            dispatch(
              addItem({ productId: product._id, name: product.name, price: product.price, qty: 1 })
            );
            toast.success("Added to cart");
          }}
          className="w-full bg-ink text-white rounded-full py-3.5 font-medium hover:bg-signal transition-colors disabled:bg-mist disabled:text-slate disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}