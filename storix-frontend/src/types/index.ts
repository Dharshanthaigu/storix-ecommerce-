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
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderLineItem {
  product: string | Product; // populated or just an id, depending on endpoint
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  items: OrderLineItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: string;
  razorpayOrderId: string;
  address: Address;
  createdAt: string;
}

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string; // category id, not the populated object
  images: string[];
}