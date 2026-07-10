import mongoose ,{Document, Schema} from "mongoose";

export interface IProduct extends Document{
    name: string;
    description?: string;
    price: number;
    stock: number;
    category: mongoose.Types.ObjectId;
    images?: string[];
    createAt: Date;
}

const ProductSchema =  new Schema<IProduct>(
    {
        name:{
            type: String,
            required: true,
            trim: true
        },
        description:{
            type: String,
            trim: true
        },
        price:{
            type: Number,
            required: true,
            min: 0
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        category:{
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        images: {
            type: [String],
            default: [],
        },
    },
    {timestamps: true}
);

const Product =  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;