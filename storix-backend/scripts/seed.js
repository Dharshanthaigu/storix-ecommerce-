const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/storix";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: { type: String, default: "customer" },
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  stock: Number,
  category: mongoose.Schema.Types.ObjectId,
  images: [String],
  brand: String,
  rating: Number,
  reviewCount: Number,
  sku: String,
  isFeatured: Boolean,
}, { timestamps: true });

const addressSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  fullName: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  country: { type: String, default: "India" },
  pincode: String,
  isDefault: Boolean,
}, { timestamps: true });

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ["percentage", "flat"], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  expiresAt: { type: Date, required: true },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Category = mongoose.model("Category", categorySchema);
const Product = mongoose.model("Product", productSchema);
const Address = mongoose.model("Address", addressSchema);
const Coupon = mongoose.model("Coupon", couponSchema);

const CATEGORY_NAMES = [
  "Electronics", "Fashion", "Home & Kitchen",
  "Sports & Fitness", "Beauty & Personal Care",
  "Grocery", "Automotive",
];

const CATEGORY_TO_DUMMYJSON = {
  "Electronics": ["smartphones", "laptops", "tablets", "mobile-accessories"],
  "Fashion": ["mens-shirts", "mens-shoes", "womens-dresses", "womens-shoes", "tops", "sunglasses", "womens-bags", "womens-jewellery", "mens-watches", "womens-watches"],
  "Home & Kitchen": ["furniture", "home-decoration", "kitchen-accessories"],
  "Sports & Fitness": ["sports-accessories"],
  "Beauty & Personal Care": ["beauty", "fragrances", "skincare"],
  "Grocery": ["groceries"],
  "Automotive": ["automotive", "motorcycle", "vehicle"],
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for seeding...");

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Address.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  console.log("Creating admin user...");
  const adminPassword = await bcrypt.hash("Admin@1234", 10);
  await User.create({
    name: "Admin User",
    email: "admin@storix.test",
    password: adminPassword,
    phone: "9000000000",
    role: "admin",
  });

  console.log("Creating regular test users...");
  const users = [];
  for (let i = 0; i < 8; i++) {
    const password = await bcrypt.hash("Password@123", 10);
    const user = await User.create({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password,
      phone: `9${faker.string.numeric(9)}`,
      role: "customer",
    });
    users.push(user);
  }

  console.log("Creating categories...");
  const categories = [];
  for (const name of CATEGORY_NAMES) {
    const category = await Category.create({
      name,
      description: faker.commerce.productDescription(),
    });
    categories.push(category);
  }

  console.log("Fetching real product data from DummyJSON per category...");
  const TARGET_PRODUCT_COUNT = 600;
  const PER_CATEGORY_TARGET = Math.ceil(TARGET_PRODUCT_COUNT / categories.length);

  const categoryProductPools = {};
  for (const catName of CATEGORY_NAMES) {
    const slugs = CATEGORY_TO_DUMMYJSON[catName];
    let pool = [];
    for (const slug of slugs) {
      const res = await fetch(`https://dummyjson.com/products/category/${slug}`);
      const data = await res.json();
      pool = pool.concat(data.products || []);
    }
    categoryProductPools[catName] = pool;
    console.log(`  ${catName}: fetched ${pool.length} real products`);
  }

  console.log("Creating products with matched real names and images...");
  for (const category of categories) {
    const pool = categoryProductPools[category.name];
    if (!pool || pool.length === 0) continue;

    for (let i = 0; i < PER_CATEGORY_TARGET; i++) {
      const source = pool[i % pool.length];

      const price = source.price;
      const hasDiscount = source.discountPercentage > 0;
      const originalPrice = hasDiscount
        ? parseFloat((price / (1 - source.discountPercentage / 100)).toFixed(2))
        : undefined;

      await Product.create({
        name: source.title,
        description: source.description,
        price,
        originalPrice,
        stock: source.stock ?? faker.number.int({ min: 0, max: 150 }),
        category: category._id,
        images: source.images?.length ? source.images.slice(0, 2) : [source.thumbnail],
        brand: source.brand || faker.company.name(),
        rating: source.rating ?? parseFloat(faker.number.float({ min: 2.5, max: 5, fractionDigits: 1 }).toFixed(1)),
        reviewCount: faker.number.int({ min: 0, max: 5000 }),
        sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
        isFeatured: faker.datatype.boolean({ probability: 0.1 }),
      });
    }
  }



  console.log("Creating addresses for test users...");
  for (const user of users) {
    await Address.create({
      user: user._id,
      fullName: user.name,
      phone: user.phone,
      addressLine1: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: "India",
      pincode: faker.location.zipCode("######"),
      isDefault: true,
    });
  }

  console.log("Creating coupons...");
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await Coupon.create([
    {
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 500,
      maxDiscount: 300,
      expiresAt: thirtyDaysFromNow,
      usageLimit: 100,
      isActive: true,
    },
    {
      code: "FLAT200",
      discountType: "flat",
      discountValue: 200,
      minOrderValue: 1000,
      expiresAt: thirtyDaysFromNow,
      usageLimit: 100,
      isActive: true,
    },
  ]);

  const totalProducts = await Product.countDocuments();

  console.log("\n✅ Seed complete!");
  console.log(`Admin login: admin@storix.test / Admin@1234`);
  console.log(`Regular users created: ${users.length} (password: Password@123 for all)`);
  console.log(`Categories: ${categories.length}`);
  console.log(`Products: ${totalProducts} (each with 2 real images)`);
  console.log(`Coupons: WELCOME10 (10% off, min ₹500), FLAT200 (₹200 off, min ₹1000)`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
