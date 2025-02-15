import mongoose from "mongoose";
import Cabang from "./Cabang.js";

const { Schema } = mongoose;

// const produkSchema = new Schema({
//   kode_produk: { type: String, required: true },
//   nama_produk: { type: String, required: true },
//   nama_cabang: { type: String, required: true },
//   kode_cabang: { type: String, required: true },
//   cabang_id: { type: Schema.Types.ObjectId, ref: "Cabang", required: true },
// });

// Membuat subdokumen untuk menyimpan data Actual, Commit, Target, Growth
const actualSchema = new Schema({
  act_jan_prev: { type: Number, required: true },
  act_des_prev: { type: Number, required: true },
  current_date_before: { type: Number, required: true },
  current_date_after: { type: Number, required: true },
});

const commitSchema = new Schema({
  current_commitment: { type: Number, required: true },
  percent_commitment: { type: Number, required: true },
  gap_commitment: { type: Number, required: true },
});

const targetSchema = new Schema({
  current_target: { type: Number, required: true },
  percent_target: { type: Number, required: true },
  gap_target: { type: Number, required: true },
});

const growthSchema = new Schema({
  monthly_change: { type: Number, required: true },
  monthly_to_date_ytd: { type: Number, required: true },
  percent_ytd: { type: Number, required: true },
  year_on_year: { type: Number, required: true },
  percent_year_on_year: { type: Number, required: true },
});

const produkSchema = new Schema({
  kode_produk: { type: String, required: true },
  nama_produk: { type: String, required: true },
  nama_cabang: { type: String, required: true },
  kode_cabang: { type: String, required: true },
  cabang_id: { type: Schema.Types.ObjectId, ref: "Cabang", required: true },
  actual: { type: actualSchema, required: false }, // Menyimpan data Actual
  commit: { type: commitSchema, required: false }, // Menyimpan data Commit
  target: { type: targetSchema, required: false }, // Menyimpan data Target
  growth: { type: growthSchema, required: false }, // Menyimpan data Growth
});

// Middleware untuk menambahkan produk ke cabang saat produk disimpan
produkSchema.pre("save", async function (next) {
  try {
    // Cari cabang berdasarkan cabang_id
    const cabang = await Cabang.findById(this.cabang_id);

    // Jika cabang ditemukan dan produk belum ada dalam produk_ids
    if (cabang && !cabang.produk_ids.includes(this._id)) {
      cabang.produk_ids.push(this._id); // Menambahkan produk ke dalam produk_ids cabang
      await cabang.save(); // Simpan perubahan pada cabang
    }

    next(); // Melanjutkan eksekusi save produk
  } catch (error) {
    console.error(error);
    next(error); // Jika terjadi error, lanjutkan dengan error
  }
});

const Produk = mongoose.model("Produk", produkSchema);

export default Produk;
