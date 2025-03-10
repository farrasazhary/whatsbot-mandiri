import express from "express";
import User from "../models/User.js";
import { registerUser, loginUser, currentUser, logoutUser } from "../controllers/authController.js";
import { protectedMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser)

router.post("/register", registerUser)

router.post("/logout", protectedMiddleware, logoutUser)

router.get("/getuser",protectedMiddleware, currentUser)

export default router