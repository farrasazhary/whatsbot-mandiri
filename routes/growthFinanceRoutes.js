import express from "express";
import { createGrowthFinancialPerformance } from "../controllers/growthFinanceController.js"; // Mengimpor controller

const router = express.Router();

// Endpoint untuk membuat data Growth Financial Performance
router.post("/growth-finance", createGrowthFinancialPerformance);

export default router;
