// import Produk from "../models/Produk.js";
// import Cabang from "../models/Cabang.js";

// export const createProduk = async (req, res) => {
//   const { kode_produk, nama_produk, nama_cabang, kode_cabang } = req.body;

//   try {
//     // Validasi data
//     if (!kode_produk || !nama_produk || !nama_cabang || !kode_cabang) {
//       return res.status(400).json({ message: "Semua field harus diisi" });
//     }

//     // Cari cabang berdasarkan kode_cabang
//     const cabang = await Cabang.findOne({ kode_cabang });

//     // Jika cabang tidak ditemukan, kirim error
//     if (!cabang) {
//       return res.status(404).json({ message: "Cabang tidak ditemukan" });
//     }

//     // Membuat objek Produk baru dengan cabang_id
//     const newProduk = new Produk({
//       kode_produk,
//       nama_produk,
//       nama_cabang,
//       kode_cabang,
//       cabang_id: cabang._id,
//     });

//     // Menyimpan produk ke MongoDB
//     await newProduk.save();

//     // Mengirim respons sukses
//     return res
//       .status(201)
//       .json({ message: "Produk berhasil dibuat", produk: newProduk });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: "Terjadi kesalahan saat menyimpan data" });
//   }
// };

import Produk from "../models/Produk.js";
import Cabang from "../models/Cabang.js";

export const createProduk = async (req, res) => {
  const {
    kode_produk,
    nama_produk,
    nama_cabang,
    kode_cabang,
    actual,
    commit,
    target,
    growth,
  } = req.body;

  try {
    // Validasi data
    if (
      !kode_produk ||
      !nama_produk ||
      !nama_cabang ||
      !kode_cabang ||
      !actual ||
      !commit ||
      !target ||
      !growth
    ) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    // Cari cabang berdasarkan kode_cabang
    const cabang = await Cabang.findOne({ kode_cabang });

    // Jika cabang tidak ditemukan, kirim error
    if (!cabang) {
      return res.status(404).json({ message: "Cabang tidak ditemukan" });
    }

    // Membuat objek Produk baru dengan cabang_id dan data actual, commit, target, growth
    const newProduk = new Produk({
      kode_produk,
      nama_produk,
      nama_cabang,
      kode_cabang,
      cabang_id: cabang._id, // Menyimpan cabang_id pada produk
      actual, // Menyimpan data actual
      commit, // Menyimpan data commit
      target, // Menyimpan data target
      growth, // Menyimpan data growth
    });

    // Menyimpan produk ke MongoDB
    await newProduk.save();

    // Mengirim respons sukses
    return res
      .status(201)
      .json({ message: "Produk berhasil dibuat", produk: newProduk });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat menyimpan data" });
  }
};

export const getProdukByCabang = async (req, res) => {
  const { cabang_id } = req.params;
  try {
    const produk = await Produk.find({ cabang_id });
    return res.status(200).json({ data: produk });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data produk" });
  }
};
