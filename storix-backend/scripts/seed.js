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
  role: { type: String, default: "user" },
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
  pincode: String,
  isDefault: Boolean,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Category = mongoose.model("Category", categorySchema);
const Product = mongoose.model("Product", productSchema);
const Address = mongoose.model("Address", addressSchema);

const CATEGORY_NAMES = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports & Fitness"];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for seeding...");

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Address.deleteMany({}),
  ]);

  console.log("Creating admin user...");
  const adminPassword = await bcrypt.hash("Admin@1234", 10);
  const admin = await User.create({
    name: "Admin User",
    email: "admin@storix.test",
    password: adminPassword,
    phone: "9000000000",
    role: "admin",
  });

  console.log("Creating regular test users...");
  const users = [];
  for (let i = 0; i < 5; i++) {
    const password = await bcrypt.hash("Password@123", 10);
    const user = await User.create({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password,
      phone: `9${faker.string.numeric(9)}`,
      role: "user",
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

  console.log("Creating products...");
  for (let i = 0; i < 40; i++) {
    const category = faker.helpers.arrayElement(categories);
    await Product.create({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 100, max: 5000 })),
      stock: faker.number.int({ min: 0, max: 100 }),
      category: category._id,
      images: [],
    });
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
      pincode: faker.location.zipCode("######"),
      isDefault: true,
    });
  }

  console.log("\n✅ Seed complete!");
  console.log(`Admin login: admin@storix.test / Admin@1234`);
  console.log(`Regular users created: ${users.length} (password: Password@123 for all)`);
  console.log(`Categories: ${categories.length}`);
  console.log(`Products: 40`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});