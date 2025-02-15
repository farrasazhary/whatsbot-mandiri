import CommitFinancialPerformance from "../models/CommitFinancialPerformance.js";
import Cabang from "../models/Cabang.js";
import Produk from "../models/Produk.js";

export const createCommitFinancialPerformance = async (req, res) => {
  const {
    nama_cabang,
    nama_produk,
    current_commitment,
    percent_commitment,
    gap_commitment,
  } = req.body;

  try {
    if (
      !nama_cabang ||
      !nama_produk ||
      !current_commitment ||
      !percent_commitment ||
      !gap_commitment
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

    const newCommitFinancialPerformance = new CommitFinancialPerformance({
      cabang_id: cabang._id,
      produk_id: produk._id,
      nama_cabang,
      nama_produk,
      current_commitment,
      percent_commitment,
      gap_commitment,
    });

    await newCommitFinancialPerformance.save();

    return res.status(201).json({
      message: "Commit Financial Performance berhasil dibuat",
      commitFinancialPerformance: newCommitFinancialPerformance,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan saat menyimpan data" });
  }
};
