// controllers/usercontroller.js — Auth controller
import { db } from "../src/db/index.js";
import { usersTable } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userregister = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    const existing = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password and insert
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [newUser] = await db
      .insert(usersTable)
      .values({ name, email, password: hashedPassword })
      .returning({ id: usersTable.id });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: `${process.env.JWT_EXPIRY_MINUTES}m`,
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const userlogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: `${process.env.JWT_EXPIRY_MINUTES}m`,
    });

    res.json({
      message: "User logged in successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const userprofile = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
      columns: { id: true, name: true, email: true, createdAt: true },
      with: { trackedJobs: true },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const userlogout = async (req, res) => {
  // JWT is stateless — client just discards the token
  res.json({ message: "User logged out successfully" });
};
