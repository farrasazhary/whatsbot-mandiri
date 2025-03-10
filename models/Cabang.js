import mongoose from "mongoose";

const { Schema } = mongoose;

const cabangSchema = new Schema({
  kode_cabang: { type: String, required: true },
  nama_cabang: { type: String, required: true },
  kelas_cabang: { type: String, required: true },
  nama_area: { type: String, required: true },
  kode_area: { type: String, required: true },
  area_id: { type: Schema.Types.ObjectId, ref: "Area" }, // Referensi ke Area
  produk_ids: [{ type: Schema.Types.ObjectId, ref: "Produk" }],
});

const Cabang = mongoose.model("Cabang", cabangSchema);

export default Cabang;
