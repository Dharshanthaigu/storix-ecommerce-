import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product";
import Category from "../models/Category";

dotenv.config();

async function debugProducts() {
  console.log("Category model loaded:", Category.modelName); // forces real usage

  console.log("Connecting to:", process.env.MONGO_URI);
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected. Querying products...");

  const count = await Product.countDocuments();
  console.log("TOTAL PRODUCTS IN DB:", count);

  const products = await Product.find().limit(3).populate("category", "name");
  console.log("SAMPLE PRODUCTS:", JSON.stringify(products, null, 2));

  await mongoose.disconnect();
  console.log("Done.");
}

debugProducts().catch((err) => {
  console.error("DEBUG SCRIPT ERROR:", err);
  process.exit(1);
});