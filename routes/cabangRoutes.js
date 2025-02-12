import express from "express";
import { createCabang } from "../controllers/cabangController.js"; // Mengimpor controller

const router = express.Router();

// Endpoint untuk membuat data Cabang
router.post("/cabang", createCabang);

export default router;
