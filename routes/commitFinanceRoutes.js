import express from "express";
import { createCommitFinancialPerformance } from "../controllers/commitFinanceController.js"; // Mengimpor controller

const router = express.Router();

// Endpoint untuk membuat data Commit Financial Performance
router.post("/commit-finance", createCommitFinancialPerformance);

export default router;
