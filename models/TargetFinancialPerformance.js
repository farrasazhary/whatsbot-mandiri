import mongoose from "mongoose";

const { Schema } = mongoose;

const targetFinancialPerformanceSchema = new Schema({
  cabang_id: { type: Schema.Types.ObjectId, ref: "Cabang" },
  produk_id: { type: Schema.Types.ObjectId, ref: "Produk" },
  nama_cabang: { type: String, required: true },
  nama_produk: { type: String, required: true },
  current_target: { type: Number, required: true },
  percent_target: { type: Number, required: true },
  gap_target: { type: Number, required: true },
});

const TargetFinancialPerformance = mongoose.model(
  "TargetFinancialPerformance",
  targetFinancialPerformanceSchema
);

export default TargetFinancialPerformance;
