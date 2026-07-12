export interface Category {
  _id: string;
  name: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: Category;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: string;
  paymentOrderId: string;
  address: Address;
  createdAt: string;
}

export interface Address {
  _id: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Coupon {
  _id: string;
  code: string;
  discountPercent: number;
  usageCount: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string; // category id, not the populated object
  images: string[];
}