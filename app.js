import express from "express";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import areaRoutes from "./routes/areaRoutes.js";
import cabangRoutes from "./routes/cabangRoutes.js";

import "dotenv/config";
import mongoose from "mongoose";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", areaRoutes);
app.use("/api", cabangRoutes);

app.use(notFound);
app.use(errorHandler);

//koneksi ke mongo
try {
  await mongoose.connect(process.env.DATABASE);
  console.log("Database connected");
} catch (error) {
  handleError(error);
}

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
