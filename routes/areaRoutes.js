import express from "express";
import {
  createArea,
  getAreaByCode,
  getAllArea,
} from "../controllers/areaController.js"; // Mengimpor controller

const router = express.Router();

// Endpoint untuk membuat data Area
router.post("/area", createArea);
router.get("/area/:kode_area", getAreaByCode);
router.get("/area", getAllArea);

export default router;
