import mongoose from "mongoose";

const { Schema } = mongoose;

const produkSchema = new Schema({
  kode_produk: { type: String, required: true },
  nama_produk: { type: String, required: true },
});

const Produk = mongoose.model("Produk", produkSchema);

export default Produk;
