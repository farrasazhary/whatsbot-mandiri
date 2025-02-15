import express from "express";
import { createActualFinancialPerformance } from "../controllers/actualFinanceController.js"; // Mengimpor controller

const router = express.Router();

// Endpoint untuk membuat data Actual Financial Performance
router.post("/actual-finance", createActualFinancialPerformance);

export default router;
