import { Request, Response } from "express";
import Product from "../models/Product";
import mongoose from "mongoose";
import Category from "../models/Category";
import { createProductSchema, updateProductSchema } from "../validators/productValidator";
import redisClient from "../config/redisClient";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message })
      return
    }

    const { name, description, price, stock, category, images } = parsed.data

    if (!mongoose.Types.ObjectId.isValid(category)) {
      res.status(400).json({ error: "Invalid category ID" });
      return;
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // Upload each image file to Cloudinary, collect resulting URLs
    const files = req.files as Express.Multer.File[] | undefined;
    const imageUrls: string[] = []

    if(files && files.length > 0){
      for(const file of files){
        const url = await uploadToCloudinary(file.buffer)
        imageUrls.push(url)
      }
    }

    const product = await Product.create({
      name,
      price,
      stock,
      category,
      ...(description && { description }),
      ...(imageUrls.length > 0 && { images: imageUrls }),
    })

    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) await redisClient.del(...keys);
    res.status(201).json({ message: "Product created successfully", product })
  }
  catch (error) {
    console.log("Create product error:", error)
    res.status(500).json({ error: "Something went wrong while creating product" });
  }
}

// Get all products (public)
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;

    const filter: Record<string, unknown> = {};
    if (category && typeof category === "string") {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        res.status(400).json({ error: "Invalid category ID" });
        return;
      }
      filter.category = category;
    }

    const cacheKey = category ? `products:category:${category}` : "products:all";

    // check cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("[Cache] Serving products from cache");
      res.status(200).json({ products: JSON.parse(cached) });
      return;
    }

    // Cache miss — fetch from DB
    console.log("[Cache] Cache miss — fetching from MongoDB");

    const products = await Product.find(filter).populate("category", "name");

    // store in cache, 60 second TTL
    await redisClient.set(cacheKey, JSON.stringify(products), "EX", 60);

    res.status(200).json({ products });
  } catch (error) {
    console.log("Get product error:", error);
    res.status(500).json({ error: "Something went wrong while fetching product" });
  }
};

// Get single product (public)
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    
    res.status(200).json({ product });
  } catch (error) {
    console.log("Get product error:", error);
    res.status(500).json({ error: "Something went wrong while fetching product" });
  }
};

// Update product (admin only)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message });
      return;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, parsed.data, {
      //returns the document after the update instead of before
      returnDocument: "after",
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) await redisClient.del(...keys);
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.log("Update product error:", error);
    res.status(500).json({ error: "Something went wrong while updating product" });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) await redisClient.del(...keys);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Delete product error:", error);
    res.status(500).json({ error: "Something went wrong while deleting product" });
  }
};