import mongoose from "mongoose";

const { Schema } = mongoose;

const growthFinancialPerformanceSchema = new Schema({
  cabang_id: { type: Schema.Types.ObjectId, ref: "Cabang" },
  produk_id: { type: Schema.Types.ObjectId, ref: "Produk" },
  nama_cabang: { type: String, required: true },
  nama_produk: { type: String, required: true },
  mutation: { type: Number, required: true },
  monthly_to_date_ytd: { type: Number, required: true },
  percent_ytd: { type: Number, required: true },
  year_on_year: { type: Number, required: true },
  percent_year_on_year: { type: Number, required: true },
});

const GrowthFinancialPerformance = mongoose.model(
  "GrowthFinancialPerformance",
  growthFinancialPerformanceSchema
);

export default GrowthFinancialPerformance;
