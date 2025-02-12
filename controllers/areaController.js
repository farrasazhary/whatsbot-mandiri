import Area from "../models/Area.js"; // Mengimpor model Area

// Fungsi untuk menambahkan data Area baru
export const createArea = async (req, res) => {
  const { kode_area, nama_area } = req.body; // Mengambil data dari body request

  try {
    // Validasi data
    if (!kode_area || !nama_area) {
      return res
        .status(400)
        .json({ message: "Kode area dan nama area harus diisi" });
    }

    // Membuat objek Area baru
    const newArea = new Area({
      kode_area,
      nama_area,
    });

    // Menyimpan data ke MongoDB
    await newArea.save();

    // Mengirim respons sukses
    return res
      .status(201)
      .json({ message: "Area berhasil dibuat", area: newArea });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat menyimpan data" });
  }
};

export const getAreaByCode = async (req, res) => {
  const { kode_area } = req.params;

  try {
    // Mencari area berdasarkan kode_area
    const area = await Area.findOne({ kode_area });

    // Jika area tidak ditemukan, kirim error
    if (!area) {
      return res.status(404).json({ message: "Area tidak ditemukan" });
    }

    // Mengirim respons sukses
    return res.status(200).json({ area });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mencari area" });
  }
};
