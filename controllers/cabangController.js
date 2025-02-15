import Cabang from "../models/Cabang.js";
import Area from "../models/Area.js"; // Mengimpor model Area untuk mencari berdasarkan nama_area

// Fungsi untuk menambahkan data Cabang baru
export const createCabang = async (req, res) => {
  const { kode_cabang, nama_cabang, kelas_cabang, nama_area, kode_area } =
    req.body;

  try {
    // Validasi data
    if (
      !kode_cabang ||
      !nama_cabang ||
      !kelas_cabang ||
      !nama_area ||
      !kode_area
    ) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    // Cari area_id berdasarkan nama_area
    const area = await Area.findOne({ kode_area });

    // Jika area tidak ditemukan, kirim error
    if (!area) {
      return res.status(404).json({ message: "Area tidak ditemukan" });
    }

    // Membuat objek Cabang baru dengan area_id
    const newCabang = new Cabang({
      kode_cabang,
      nama_cabang,
      kelas_cabang,
      nama_area,
      kode_area,
      area_id: area._id, // Gunakan _id area yang ditemukan
    });

    // Menyimpan data ke MongoDB
    await newCabang.save();

    // Mengirim respons sukses
    return res
      .status(201)
      .json({ message: "Cabang berhasil dibuat", cabang: newCabang });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat menyimpan data" });
  }
};

// Fungsi untuk mendapatkan semua data Cabang
export const getAllCabang = async (req, res) => {
  try {
    const cabang = await Cabang.find();
    return res.status(200).json({ message: "Get all Cabang", data: cabang });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mencari data" });
  }
};

export const getCabangWithProduk = async (req, res) => {
  try {
    const cabang = await Cabang.find().populate("produk_ids");
    return res.status(200).json({ message: "Get all Cabang", data: cabang });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mencari data" });
  }
};

export const getCabangByCode = async (req, res) => {
  const { kode_cabang } = req.params;

  try {
    // Mencari cabang berdasarkan kode_cabang
    const cabang = await Cabang.findOne({ kode_cabang }); // Menggunakan kode_cabang

    // Jika cabang tidak ditemukan, kirim error
    if (!cabang) {
      return res.status(404).json({ message: "Cabang tidak ditemukan" });
    }

    // Mengirim respons sukses
    return res.status(200).json({ cabang });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mencari cabang" });
  }
};

export const getCabangByArea = async (req, res) => {
  const { area_id } = req.params;
  try {
    const cabang = await Cabang.find({ area_id });
    return res.status(200).json({ data: cabang });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data cabang" });
  }
};
