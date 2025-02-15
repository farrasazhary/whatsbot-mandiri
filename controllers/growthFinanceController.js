import GrowthFinancialPerformance from "../models/GrowthFinancialPerformance.js";
import Cabang from "../models/Cabang.js";
import Produk from "../models/Produk.js";

export const createGrowthFinancialPerformance = async (req, res) => {
  const {
    nama_cabang,
    nama_produk,
    mutation,
    monthly_to_date_ytd,
    percent_ytd,
    year_on_year,
    percent_year_on_year,
  } = req.body;

  try {
    if (
      !nama_cabang ||
      !nama_produk ||
      !mutation ||
      !monthly_to_date_ytd ||
      !percent_ytd ||
      !year_on_year ||
      !percent_year_on_year
    ) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    const cabang = await Cabang.findOne({
      nama_cabang: { $regex: nama_cabang, $options: "i" },
    });
    const produk = await Produk.findOne({
      nama_produk: { $regex: nama_produk, $options: "i" },
    });

    if (!cabang || !produk) {
      return res
        .status(404)
        .json({ message: "Cabang atau Produk tidak ditemukan" });
    }

    // Tambahkan produk ke cabang jika belum ada
    if (!cabang.produk_ids.includes(produk._id)) {
      cabang.produk_ids.push(produk._id);
      await cabang.save(); // Simpan perubahan pada cabang
    }

    const newGrowthFinancialPerformance = new GrowthFinancialPerformance({
      cabang_id: cabang._id,
      produk_id: produk._id,
      nama_cabang,
      nama_produk,
      mutation,
      monthly_to_date_ytd,
      percent_ytd,
      year_on_year,
      percent_year_on_year,
    });

    await newGrowthFinancialPerformance.save();

    return res.status(201).json({
      message: "Growth Financial Performance berhasil dibuat",
      data: newGrowthFinancialPerformance,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat menyimpan data" });
  }
};
