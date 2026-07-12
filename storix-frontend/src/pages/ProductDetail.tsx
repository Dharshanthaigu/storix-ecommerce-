import { useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchProductById } from "../features/products/productSlice";
import { addItem } from "../features/cart/cartSlice";
import ImageCarousel from "../components/ImageCarousel";
import Loader from "../components/Loader";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const product = useAppSelector((s) => s.products.current);
  const status = useAppSelector((s) => s.products.status);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [dispatch, id]);

  if (status === "loading" || !product) return <Loader />;

  return (
    <div className="p-4 grid md:grid-cols-2 gap-6">
      <ImageCarousel images={product.images} />
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <p className="text-xl font-bold mt-4">₹{product.price}</p>
        <button
          disabled={product.stock === 0}
          onClick={() => {
            dispatch(
              addItem({
                productId: product._id,
                name: product.name,
                price: product.price,
                qty: 1,
              })
            );
            toast.success("Added to cart");
          }}
          className="mt-4 bg-black text-white px-4 py-2 rounded disabled:opacity-40"
        >
          {product.stock === 0 ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}