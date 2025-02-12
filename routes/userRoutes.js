import express from "express";
import { protectedMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import { getAllUsers } from "../controllers/userController.js"

const router = express.Router();

router.get("/", protectedMiddleware, adminMiddleware, getAllUsers)

export default router