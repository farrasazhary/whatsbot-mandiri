import ActualFinancialPerformance from "../models/ActualFinancialPerformance.js";
import Cabang from "../models/Cabang.js";
import Produk from "../models/Produk.js";

export const createActualFinancialPerformance = async (req, res) => {
  const {
    nama_cabang,
    nama_produk,
    act_jan_prev,
    act_dec_prev,
    current_date_before,
    current_date_after,
  } = req.body;

  try {
    if (
      !nama_cabang ||
      !nama_produk ||
      !act_jan_prev ||
      !act_dec_prev ||
      !current_date_before ||
      !current_date_after
    ) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    const cabang = await Cabang.findOne({ nama_cabang });
    const produk = await Produk.findOne({ nama_produk });

    if (!cabang || !produk) {
      return res
        .status(404)
        .json({ message: "Cabang atau Produk tidak ditemukan" });
    }

    const newActualFinancialPerformance = new ActualFinancialPerformance({
      cabang_id: cabang._id,
      produk_id: produk._id,
      nama_cabang,
      nama_produk,
      act_jan_prev,
      act_dec_prev,
      current_date_before,
      current_date_after,
    });

    await newActualFinancialPerformance.save();

    return res.status(201).json({
      message: "Actual Financial Performance berhasil dibuat",
      actualFinancialPerformance: newActualFinancialPerformance,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat menyimpan data" });
  }
};
