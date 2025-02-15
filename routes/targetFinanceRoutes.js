import express from "express";
import { createTargetFinancialPerformance } from "../controllers/targetFinanceController.js"; // Mengimpor controller

const router = express.Router();

// Endpoint untuk membuat data Target Financial Performance
router.post("/target-finance", createTargetFinancialPerformance);

export default router;
