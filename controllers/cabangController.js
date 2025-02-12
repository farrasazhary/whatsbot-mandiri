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
