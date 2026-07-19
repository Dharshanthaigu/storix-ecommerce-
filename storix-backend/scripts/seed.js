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
  stock: Number,
  category: mongoose.Schema.Types.ObjectId,
  images: [String],
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
  "Electronics", "Fashion", "Home & Kitchen", "Books",
  "Sports & Fitness", "Beauty & Personal Care", "Toys & Games",
  "Grocery", "Automotive", "Pet Supplies",
];

const PRODUCTS_PER_CATEGORY = 12; // 12 x 10 categories = 120 products

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

  console.log("Creating products with real images...");
  let imgSeed = 0;
  for (const category of categories) {
    for (let i = 0; i < PRODUCTS_PER_CATEGORY; i++) {
      await Product.create({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 100, max: 8000 })),
        stock: faker.number.int({ min: 0, max: 150 }),
        category: category._id,
        images: [
          `https://picsum.photos/seed/storix-${imgSeed}-a/600/600`,
          `https://picsum.photos/seed/storix-${imgSeed}-b/600/600`,
        ],
      });
      imgSeed++;
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

  const totalProducts = categories.length * PRODUCTS_PER_CATEGORY;

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