import TargetFinancialPerformance from "../models/TargetFinancialPerformance.js";
import Cabang from "../models/Cabang.js";
import Produk from "../models/Produk.js";

export const createTargetFinancialPerformance = async (req, res) => {
  const {
    nama_cabang,
    nama_produk,
    current_target,
    percent_target,
    gap_target,
  } = req.body;

  try {
    if (
      !nama_cabang ||
      !nama_produk ||
      !current_target ||
      !percent_target ||
      !gap_target
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

    const newTargetFinancialPerformance = new TargetFinancialPerformance({
      cabang_id: cabang._id,
      produk_id: produk._id,
      nama_cabang,
      nama_produk,
      current_target,
      percent_target,
      gap_target,
    });

    await newTargetFinancialPerformance.save();

    return res.status(201).json({
      message: "Target Financial Performance berhasil dibuat",
      targetFinancialPerformance: newTargetFinancialPerformance,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat menyimpan data" });
  }
};

export const getTargetFinancialPerformance = async (req, res) => {
  try {
    const targetFinancialPerformances = await TargetFinancialPerformance.find();
    return res.status(200).json({
      message: "Get all Target Financial Performances",
      data: targetFinancialPerformances,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mencari data" });
  }
};
