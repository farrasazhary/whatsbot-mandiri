import express from "express";
import {
  createProduk,
  getProdukByCabang,
} from "../controllers/produkController.js"; // Mengimpor controller

const router = express.Router();

// Endpoint untuk membuat data Produk
router.post("/produk", createProduk);
router.get("/produk/:cabang_id", getProdukByCabang);

export default router;
