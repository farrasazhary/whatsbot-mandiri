import express from "express";
import {
  createCabang,
  getAllCabang,
  getCabangWithProduk,
  getCabangByArea,
} from "../controllers/cabangController.js"; // Mengimpor controller

const router = express.Router();

// Endpoint untuk membuat data Cabang
router.post("/cabang", createCabang);
router.get("/cabang", getAllCabang);
router.get("/cabang/produk", getCabangWithProduk);
router.get("/cabang/:area_id", getCabangByArea);

export default router;
