import mongoose from "mongoose";

const { Schema } = mongoose;

const actualFinancialPerformanceSchema = new Schema({
  area_id: { type: Schema.Types.ObjectId, ref: "Area" },
  cabang_id: { type: Schema.Types.ObjectId, ref: "Cabang" },
  produk_id: { type: Schema.Types.ObjectId, ref: "Produk" },
  date_reported: { type: Date, required: true },
  act_jan_prev: { type: Number, required: true },
  act_dec_prev: { type: Number, required: true },
  current_date_before: { type: Number, required: true },
  current_date_after: { type: Number, required: true },
});

const ActualFinancialPerformance = mongoose.model(
  "ActualFinancialPerformance",
  actualFinancialPerformanceSchema
);

export default ActualFinancialPerformance;
