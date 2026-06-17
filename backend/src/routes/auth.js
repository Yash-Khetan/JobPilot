// src/routes/auth.js — Authentication routes
import { Router } from "express";
import {
  userregister,
  userlogin,
  userprofile,
  userlogout,
} from "../../controllers/usercontroller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/signup — register a new user, return JWT
router.post("/signup", userregister);

// POST /api/auth/login — login, return JWT
router.post("/login", userlogin);

// GET  /api/auth/me — (protected) return current user profile
router.get("/me", authenticate, userprofile);

// POST /api/auth/logout — (protected) logout
router.post("/logout", authenticate, userlogout);

export default router;
