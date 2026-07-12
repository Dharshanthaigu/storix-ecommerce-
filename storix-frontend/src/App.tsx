import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";
import Addresses from "./pages/Addresses";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminCoupons from "./pages/admin/Coupons";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Navbar />
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/addresses" element={<Addresses />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/coupons" element={<AdminCoupons />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}