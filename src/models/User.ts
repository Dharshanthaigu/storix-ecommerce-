import mongoose,{Document, Schema} from "mongoose";

export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    phone: string;
    role: "customer" | "admin";
    createAt: Date
}

const UserSchema =  new Schema<IUser>(
    {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
//   add and manage date espically createAt and updatedAt
  { timestamps: true }
);

const User = mongoose.model<IUser>("User",UserSchema)

export default User;