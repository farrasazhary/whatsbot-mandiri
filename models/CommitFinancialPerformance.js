import mongoose from "mongoose";

const { Schema } = mongoose;

const commitFinancialPerformanceSchema = new Schema({
  area_id: { type: Schema.Types.ObjectId, ref: "Area" },
  cabang_id: { type: Schema.Types.ObjectId, ref: "Cabang" },
  produk_id: { type: Schema.Types.ObjectId, ref: "Produk" },
  current_commitment: { type: Number, required: true },
  percent_commitment: { type: Number, required: true },
  gap_commitment: { type: Number, required: true },
});

const CommitFinancialPerformance = mongoose.model(
  "CommitFinancialPerformance",
  commitFinancialPerformanceSchema
);

export default CommitFinancialPerformance;
