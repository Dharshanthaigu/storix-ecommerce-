import mongoose, {Document , Schema} from "mongoose";

export interface IOrderItem{
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

export interface IOrder extends Document{
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];
    address: mongoose.Types.ObjectId;
    totalAmount: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
    paymentStatus: "pending" | "paid" | "failed";
    idempotencyKey: string;   // ← fixed casing
    razorpayOrderId?: string;
    couponCode?: string;           // ← added to interface
    discountAmount?: number;       // ← added to interface
    createAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled","refunded"],
      default: "pending",
    },
    paymentStatus:{
      type: String,
      enum: ["pending", "paid" , "failed"],
      default: "pending"
    },
    razorpayOrderId: {
      type: String,
    },
    couponCode: {              // ← added to schema
      type: String,
    },
    discountAmount: {           // ← added to schema
      type: Number,
      default: 0,
    },
    idempotencyKey:{
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;