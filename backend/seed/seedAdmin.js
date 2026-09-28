// Run once with: npm run seed:admin
// Creates the first owner-level admin account from your .env values.
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const email = process.env.FIRST_ADMIN_EMAIL;
  const password = process.env.FIRST_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Set FIRST_ADMIN_EMAIL and FIRST_ADMIN_PASSWORD in .env first.");
    process.exit(1);
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`Admin ${email} already exists. Nothing to do.`);
    process.exit(0);
  }

  await Admin.create({
    name: "Store Owner",
    email,
    password,
    role: "owner",
  });

  console.log(`Owner admin created: ${email}`);
  process.exit(0);
};

run();
