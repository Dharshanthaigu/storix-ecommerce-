import mongoose ,{Document, Schema} from "mongoose";

export interface IProduct extends Document{
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    stock: number;
    category: mongoose.Types.ObjectId;
    images?: string[];
    brand?: string;
    rating?: number;
    reviewCount?: number;
    sku?: string;
    isFeatured?: boolean;
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
        originalPrice: {
            type: Number,
            min: 0,
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
        brand: {
            type: String,
            trim: true,
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        reviewCount: {
            type: Number,
            min: 0,
            default: 0,
        },
        sku: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    {timestamps: true}
);

const Product =  mongoose.model<IProduct>("Product", ProductSchema);
export default Product;