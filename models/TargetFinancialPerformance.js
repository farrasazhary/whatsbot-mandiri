import mongoose from "mongoose";

const { Schema } = mongoose;

const targetFinancialPerformanceSchema = new Schema({
  area_id: { type: Schema.Types.ObjectId, ref: "Area" },
  cabang_id: { type: Schema.Types.ObjectId, ref: "Cabang" },
  produk_id: { type: Schema.Types.ObjectId, ref: "Produk" },
  current_target: { type: Number, required: true },
  percent_target: { type: Number, required: true },
  gap_target: { type: Number, required: true },
});

const TargetFinancialPerformance = mongoose.model(
  "TargetFinancialPerformance",
  targetFinancialPerformanceSchema
);

export default TargetFinancialPerformance;
