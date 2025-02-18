import whatsapp from "whatsapp-web.js";
const { Client, LocalAuth } = whatsapp;
import qrcode from "qrcode-terminal";
import axios from "axios"; // Menggunakan axios untuk mengambil data

// Inisialisasi client WhatsApp menggunakan LocalAuth
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true },
});

// Menyimpan sesi pengguna
let lastOnlineTime = new Date(); // Catat waktu terakhir bot online
let userState = {}; // Menyimpan status percakapan per pengguna

// Menampilkan QR code untuk login ke WhatsApp Web (gunakan aplikasi WhatsApp untuk memindai)
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Ketika client sudah siap
client.on("ready", async () => {
  console.log("Whatsapp web terhubung!");
  lastOnlineTime = new Date();
});

// Ketika pesan masuk
client.on("message", async (msg) => {
  const userMessage = msg.body.trim(); // Menghapus spasi ekstra
  const userId = msg.from; // ID pengguna yang mengirim pesan

  console.log("Received message:", userMessage); // Log pesan yang diterima
  if (new Date(msg.timestamp * 1000) < lastOnlineTime) {
    console.log("Mengabaikan pesan karena diterima ketika bot offline.");
    return; // Abaikan pesan yang diterima selama bot offline
  }

  // Jika pengguna mengetik !menu, mulai percakapan
  if (userMessage === "!menu") {
    userState[userId] = { stage: "category", history: [] }; // Menyimpan status pengguna dan riwayat
    const areas = await fetchData("area"); // Ambil data area dari API

    const message =
      "Selamat datang di MANDIRI. Silahkan pilih Area dengan cara mengetik nomor tujuan:\n" +
      areas.map((area, index) => `${index + 1}. ${area.nama_area}`).join("\n") +
      "\n0. Kembali"; // Tambahkan opsi kembali
    const buttons = areas.map((area, index) => ({
      body: `${index + 1}. ${area.nama_area}`,
    }));
    buttons.push({ body: "0. Kembali" }); // Opsi kembali

    client.sendMessage(msg.from, message, { buttons });
  }

  // Pilih kategori (Area)
  else if (userState[userId]?.stage === "category") {
    if (userMessage === "0") {
      // Jika memilih "0", kembali ke menu utama
      return client.sendMessage(
        msg.from,
        "Silakan mulai dengan mengetik *!menu*."
      );
    }

    const areaIndex = parseInt(userMessage) - 1; // Index area yang dipilih

    const areas = await fetchData("area"); // Ambil data area lagi
    if (!areas[areaIndex]) {
      return client.sendMessage(
        msg.from,
        "Area yang dipilih tidak valid. Silakan coba lagi."
      );
    }

    const selectedArea = areas[areaIndex];
    userState[userId].selectedArea = selectedArea; // Menyimpan area yang dipilih
    userState[userId].stage = "branch"; // Ubah ke tahap cabang
    userState[userId].history.push("category"); // Simpan kategori di riwayat

    const cabangData = await fetchData(`cabang/${selectedArea._id}`);
    const cabangMessage =
      `Silahkan pilih cabang untuk ${selectedArea.nama_area}:\n` +
      cabangData
        .map((cabang, index) => `${index + 1}. ${cabang.nama_cabang}`)
        .join("\n") +
      "\n0. Kembali"; // Tambahkan opsi kembali
    const cabangButtons = cabangData.map((cabang, index) => ({
      body: `${index + 1}. ${cabang.nama_cabang}`,
    }));
    cabangButtons.push({ body: "0. Kembali" }); // Opsi kembali

    client.sendMessage(msg.from, cabangMessage, { buttons: cabangButtons });
  }

  // Pilih cabang
  else if (userState[userId]?.stage === "branch") {
    if (userMessage === "0") {
      // Jika memilih "0", kembali ke kategori
      userState[userId].stage = "category"; // Kembali ke kategori
      userState[userId].history.pop(); // Menghapus riwayat terakhir
      const areas = await fetchData("area");
      const message =
        "Silakan pilih Area dengan cara mengetik nomor tujuan:\n" +
        areas
          .map((area, index) => `${index + 1}. ${area.nama_area}`)
          .join("\n") +
        "\n0. Kembali"; // Menampilkan menu kategori lagi
      const buttons = areas.map((area, index) => ({
        body: `${index + 1}. ${area.nama_area}`,
      }));
      buttons.push({ body: "0. Kembali" }); // Opsi kembali
      return client.sendMessage(msg.from, message, { buttons });
    }

    const cabangIndex = parseInt(userMessage) - 1; // Index cabang yang dipilih
    const selectedArea = userState[userId].selectedArea;

    const cabangData = await fetchData(`cabang/${selectedArea._id}`);
    if (!cabangData[cabangIndex]) {
      return client.sendMessage(
        msg.from,
        "Cabang yang dipilih tidak valid. Silakan coba lagi."
      );
    }

    const selectedCabang = cabangData[cabangIndex];
    userState[userId].selectedCabang = selectedCabang; // Menyimpan cabang yang dipilih
    userState[userId].stage = "product"; // Ubah ke tahap produk
    userState[userId].history.push("branch"); // Simpan cabang di riwayat

    const produkData = await fetchData(`produk/${selectedCabang._id}`);
    const produkMessage =
      `Silahkan pilih produk untuk cabang ${selectedCabang.nama_cabang}:\n` +
      produkData
        .map((produk, index) => `${index + 1}. ${produk.nama_produk}`)
        .join("\n") +
      "\n0. Kembali"; // Tambahkan opsi kembali
    const produkButtons = produkData.map((produk, index) => ({
      body: `${index + 1}. ${produk.nama_produk}`,
    }));
    produkButtons.push({ body: "0. Kembali" }); // Opsi kembali

    client.sendMessage(msg.from, produkMessage, { buttons: produkButtons });
  }

  // // Pilih produk
  else if (userState[userId]?.stage === "product") {
    if (userMessage === "0") {
      // Jika memilih "0", kembali ke menu produk
      const selectedCabang = userState[userId].selectedCabang;
      userState[userId].stage = "product"; // Tetap di stage produk
      userState[userId].history.pop(); // Menghapus riwayat terakhir

      // Ambil data produk berdasarkan cabang yang dipilih sebelumnya
      const produkData = await fetchData(`produk/${selectedCabang._id}`);
      const produkMessage =
        `Silahkan pilih produk untuk cabang ${selectedCabang.nama_cabang}:\n` +
        produkData
          .map((produk, index) => `${index + 1}. ${produk.nama_produk}`)
          .join("\n") +
        "\n0. Kembali"; // Opsi kembali pada menu produk

      const produkButtons = produkData.map((produk, index) => ({
        body: `${index + 1}. ${produk.nama_produk}`,
      }));
      produkButtons.push({ body: "0. Kembali" }); // Opsi kembali

      // Mengirimkan menu produk lagi
      client.sendMessage(msg.from, produkMessage, { buttons: produkButtons });
      return;
    }

    const produkIndex = parseInt(userMessage) - 1; // Index produk yang dipilih
    const selectedCabang = userState[userId].selectedCabang;

    const produkData = await fetchData(`produk/${selectedCabang._id}`);
    if (!produkData[produkIndex]) {
      return client.sendMessage(
        msg.from,
        "Produk yang dipilih tidak valid. Silakan coba lagi."
      );
    }

    function capitalizeFirstLetter(text) {
      return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    }

    // Fungsi untuk menentukan emoji berdasarkan nilai actual
    function getEmoji(value) {
      if (value >= 100) {
        return "🟢"; // Hijau untuk nilai >= 100
      } else if (value >= 96 && value <= 99) {
        return "🟡"; // Kuning untuk nilai antara 96 dan 99
      } else if (value >= 0 && value < 96) {
        return "🔴"; // Merah untuk nilai antara 0 dan 95
      }
      return ""; // Tidak ada emoji jika nilai tidak valid
    }

    const selectedProduk = produkData[produkIndex];
    // Menampilkan detail produk beserta actual, commit, target, dan growth
    const produkDetailMessage = `
        *Detail Produk:*
        Nama Produk: ${capitalizeFirstLetter(selectedProduk.nama_produk)}
        Nama Cabang: ${capitalizeFirstLetter(selectedProduk.nama_cabang)}

        *Actual:*
        - 31/01/2024: ${
          selectedProduk.actual.act_jan_prev || "Tidak tersedia"
        } ${getEmoji(selectedProduk.actual.act_jan_prev || 0)}
        - 31/12/2024: ${
          selectedProduk.actual.act_des_prev || "Tidak tersedia"
        } ${getEmoji(selectedProduk.actual.act_des_prev || 0)}
        - 25 Jan 2025 - pkl 20.00: ${
          selectedProduk.actual.current_date_before || "Tidak tersedia"
        } ${getEmoji(selectedProduk.actual.current_date_before || 0)}
        - 25 Jan 2025 - pkl 17.00: ${
          selectedProduk.actual.current_date_after || "Tidak tersedia"
        } ${getEmoji(selectedProduk.actual.current_date_after || 0)}

        *Commitment:*
        - Komitmen Jan '25: ${
          selectedProduk.commit.current_commitment || "Tidak tersedia"
        }
        - % thd Komit: ${
          selectedProduk.commit.percent_commitment || "Tidak tersedia"
        }
        - Gap thd Komit: ${
          selectedProduk.commit.gap_commitment || "Tidak tersedia"
        }

        *Target:*
        - Target Jan'25: ${
          selectedProduk.target.current_target || "Tidak tersedia"
        }
        - % thd Target: ${
          selectedProduk.target.percent_target || "Tidak tersedia"
        }
        - Gap thd Target: ${
          selectedProduk.target.gap_target || "Tidak tersedia"
        }

        *Growth:*
        - Mutasi: ${selectedProduk.growth.monthly_change || "Tidak tersedia"}
        - MtD/YtD: ${
          selectedProduk.growth.monthly_to_date_ytd || "Tidak tersedia"
        }
        - % MtD/YtD: ${selectedProduk.growth.percent_ytd || "Tidak tersedia"}
        - YoY: ${selectedProduk.growth.year_on_year || "Tidak tersedia"}
        - % YoY: ${
          selectedProduk.growth.percent_year_on_year || "Tidak tersedia"
        }

        0. Kembali
    `;

    // Mengirimkan detail produk dengan opsi kembali
    client.sendMessage(msg.from, produkDetailMessage);

    // Simpan produk ke riwayat
    userState[userId].history.push("product");
    userState[userId].stage = "product";
  }

  // Jika tidak berada di salah satu tahapan yang valid
  else {
    client.sendMessage(
      msg.from,
      "Hallo, selamat datang di MANDIRI. Silakan mulai dengan mengetik (*!menu*)."
    );
  }
});

// Fungsi untuk mengambil data (area, cabang, produk) menggunakan axios
async function fetchData(type, id = "") {
  const url = `http://localhost:3000/api/${type}${id ? `/${id}` : ""}`;

  try {
    const response = await axios.get(url); // Menggunakan axios.get() untuk request data
    return response.data.data; // Mengembalikan data yang diambil dari response
  } catch (error) {
    console.error("Error fetching data:", error);
    return []; // Mengembalikan array kosong jika terjadi error
  }
}

client.initialize();
export default client;

// import whatsapp from "whatsapp-web.js";
// const { Client, LocalAuth } = whatsapp;
// import qrcode from "qrcode-terminal";
// import axios from "axios"; // Menggunakan axios untuk mengambil data

// // Inisialisasi client WhatsApp menggunakan LocalAuth
// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: { headless: true },
// });

// // Menyimpan sesi pengguna
// let lastOnlineTime = new Date(); // Catat waktu terakhir bot online
// let userState = {}; // Menyimpan status percakapan per pengguna

// // Menampilkan QR code untuk login ke WhatsApp Web (gunakan aplikasi WhatsApp untuk memindai)
// client.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
// });

// // Ketika client sudah siap
// client.on("ready", async () => {
//   console.log("Whatsapp web terhubung!");
//   lastOnlineTime = new Date();
// });

// // Menampilkan pesan untuk memilih area
// async function showAreaMenu(msg) {
//   const areas = await fetchData("area");
//   const message =
//     "Silakan pilih Area dengan cara mengetik nomor tujuan:\n" +
//     areas.map((area, index) => `${index + 1}. ${area.nama_area}`).join("\n");

//   const buttons = areas.map((area, index) => ({
//     body: `${index + 1}. ${area.nama_area}`,
//   }));

//   buttons.push({ body: "0. Kembali" }); // Opsi kembali
//   client.sendMessage(msg.from, message, { buttons });
// }

// // Menampilkan pesan untuk memilih cabang
// async function showBranchMenu(msg, selectedArea) {
//   const cabangData = await fetchData(`cabang/${selectedArea._id}`);
//   const cabangMessage =
//     `Silahkan pilih cabang untuk ${selectedArea.nama_area}:\n` +
//     cabangData
//       .map((cabang, index) => `${index + 1}. ${cabang.nama_cabang}`)
//       .join("\n") +
//     "\n0. Kembali"; // Opsi kembali

//   const cabangButtons = cabangData.map((cabang, index) => ({
//     body: `${index + 1}. ${cabang.nama_cabang}`,
//   }));
//   cabangButtons.push({ body: "0. Kembali" }); // Opsi kembali

//   client.sendMessage(msg.from, cabangMessage, { buttons: cabangButtons });
// }

// // Menampilkan pesan untuk memilih produk
// async function showProductMenu(msg, selectedCabang) {
//   const produkData = await fetchData(`produk/${selectedCabang._id}`);
//   const produkMessage =
//     `Silahkan pilih produk untuk cabang ${selectedCabang.nama_cabang}:\n` +
//     produkData
//       .map((produk, index) => `${index + 1}. ${produk.nama_produk}`)
//       .join("\n") +
//     "\n0. Kembali"; // Opsi kembali

//   const produkButtons = produkData.map((produk, index) => ({
//     body: `${index + 1}. ${produk.nama_produk}`,
//   }));
//   produkButtons.push({ body: "0. Kembali" }); // Opsi kembali

//   client.sendMessage(msg.from, produkMessage, { buttons: produkButtons });
// }

// // Menampilkan detail produk
// async function showProductDetail(msg, selectedCabang, selectedProduk) {
//   const produkDetailMessage =
//     `*Detail Produk:*\n` +
//     `Nama Produk: ${selectedProduk.nama_produk}\n` +
//     `Nama Cabang: ${selectedCabang.nama_cabang}\n` +
//     `*Actual:*\n` +
//     `- 31/01/2024: ${
//       selectedProduk.actual.act_jan_prev || "Tidak tersedia"
//     } ${getEmoji(selectedProduk.actual.act_jan_prev || 0)}\n` +
//     `- 31/12/2024: ${
//       selectedProduk.actual.act_des_prev || "Tidak tersedia"
//     } ${getEmoji(selectedProduk.actual.act_des_prev || 0)}\n` +
//     `- 25 Jan 2025 - pkl 20.00: ${
//       selectedProduk.actual.current_date_before || "Tidak tersedia"
//     } ${getEmoji(selectedProduk.actual.current_date_before || 0)}\n` +
//     `- 25 Jan 2025 - pkl 17.00: ${
//       selectedProduk.actual.current_date_after || "Tidak tersedia"
//     } ${getEmoji(selectedProduk.actual.current_date_after || 0)}\n\n` +
//     `*Commitment:*\n` +
//     `- Komitmen Jan '25: ${
//       selectedProduk.commit.current_commitment || "Tidak tersedia"
//     }\n` +
//     `- % thd Komit: ${
//       selectedProduk.commit.percent_commitment || "Tidak tersedia"
//     }\n` +
//     `- Gap thd Komit: ${
//       selectedProduk.commit.gap_commitment || "Tidak tersedia"
//     }\n\n` +
//     `*Target:*\n` +
//     `- Target Jan'25: ${
//       selectedProduk.target.current_target || "Tidak tersedia"
//     }\n` +
//     `- % thd Target: ${
//       selectedProduk.target.percent_target || "Tidak tersedia"
//     }\n` +
//     `- Gap thd Target: ${
//       selectedProduk.target.gap_target || "Tidak tersedia"
//     }\n\n` +
//     `*Growth:*\n` +
//     `- Mutasi: ${selectedProduk.growth.monthly_change || "Tidak tersedia"}\n` +
//     `- MtD/YtD: ${
//       selectedProduk.growth.monthly_to_date_ytd || "Tidak tersedia"
//     }\n` +
//     `- % MtD/YtD: ${selectedProduk.growth.percent_ytd || "Tidak tersedia"}\n` +
//     `- YoY: ${selectedProduk.growth.year_on_year || "Tidak tersedia"}\n` +
//     `- % YoY: ${
//       selectedProduk.growth.percent_year_on_year || "Tidak tersedia"
//     }\n\n` +
//     `0. Kembali`;

//   client.sendMessage(msg.from, produkDetailMessage);
// }

// // Fungsi untuk menentukan emoji berdasarkan nilai actual
// function getEmoji(value) {
//   if (value >= 100) {
//     return "🟢"; // Hijau untuk nilai >= 100
//   } else if (value >= 96 && value <= 99) {
//     return "🟡"; // Kuning untuk nilai antara 96 dan 99
//   } else if (value >= 0 && value < 96) {
//     return "🔴"; // Merah untuk nilai antara 0 dan 95
//   }
//   return ""; // Tidak ada emoji jika nilai tidak valid
// }

// // Ketika pesan masuk
// client.on("message", async (msg) => {
//   const userMessage = msg.body.trim(); // Menghapus spasi ekstra
//   const userId = msg.from; // ID pengguna yang mengirim pesan

//   console.log("Received message:", userMessage); // Log pesan yang diterima
//   if (new Date(msg.timestamp * 1000) < lastOnlineTime) {
//     console.log("Mengabaikan pesan karena diterima ketika bot offline.");
//     return; // Abaikan pesan yang diterima selama bot offline
//   }

//   // Jika pengguna mengetik !menu, mulai percakapan
//   if (userMessage === "!menu") {
//     userState[userId] = { stage: "category", history: [] }; // Menyimpan status pengguna dan riwayat
//     showAreaMenu(msg);
//   }

//   // Pilih kategori (Area)
//   else if (userState[userId]?.stage === "category") {
//     if (userMessage === "0") {
//       // Jika memilih "0", kembali ke menu utama
//       return client.sendMessage(
//         msg.from,
//         "Silakan mulai dengan mengetik *!menu*."
//       );
//     }

//     const areaIndex = parseInt(userMessage) - 1; // Index area yang dipilih

//     const areas = await fetchData("area");
//     if (!areas[areaIndex]) {
//       return client.sendMessage(
//         msg.from,
//         "Area yang dipilih tidak valid. Silakan coba lagi."
//       );
//     }

//     const selectedArea = areas[areaIndex];
//     userState[userId].selectedArea = selectedArea;
//     userState[userId].stage = "branch"; // Ubah ke tahap cabang
//     userState[userId].history.push("category"); // Simpan kategori di riwayat
//     showBranchMenu(msg, selectedArea);
//   }

//   // Pilih cabang
//   else if (userState[userId]?.stage === "branch") {
//     if (userMessage === "0") {
//       // Jika memilih "0", kembali ke kategori
//       userState[userId].stage = "category"; // Kembali ke kategori
//       userState[userId].history.pop(); // Menghapus riwayat terakhir
//       showAreaMenu(msg);
//       return;
//     }

//     const cabangIndex = parseInt(userMessage) - 1;
//     const selectedArea = userState[userId].selectedArea;

//     const cabangData = await fetchData(`cabang/${selectedArea._id}`);
//     if (!cabangData[cabangIndex]) {
//       return client.sendMessage(
//         msg.from,
//         "Cabang yang dipilih tidak valid. Silakan coba lagi."
//       );
//     }

//     const selectedCabang = cabangData[cabangIndex];
//     userState[userId].selectedCabang = selectedCabang;
//     userState[userId].stage = "product"; // Ubah ke tahap produk
//     userState[userId].history.push("branch"); // Simpan cabang di riwayat
//     showProductMenu(msg, selectedCabang);
//   }

//   // Pilih produk
//   else if (userState[userId]?.stage === "product") {
//     if (userMessage === "0") {
//       // Jika memilih "0", kembali ke menu cabang
//       const selectedArea = userState[userId].selectedArea;
//       userState[userId].history.pop(); // Menghapus riwayat terakhir
//       userState[userId].stage = "branch"; // Kembali ke cabang
//       showBranchMenu(msg, selectedArea);
//       return;
//     }

//     const produkIndex = parseInt(userMessage) - 1;
//     const selectedCabang = userState[userId].selectedCabang;

//     const produkData = await fetchData(`produk/${selectedCabang._id}`);
//     if (!produkData[produkIndex]) {
//       return client.sendMessage(
//         msg.from,
//         "Produk yang dipilih tidak valid. Silakan coba lagi."
//       );
//     }

//     const selectedProduk = produkData[produkIndex];
//     showProductDetail(msg, selectedCabang, selectedProduk);
//     userState[userId].history.push("product");
//     userState[userId].stage = "product";
//   }

//   // Jika tidak berada di salah satu tahapan yang valid
//   else {
//     client.sendMessage(
//       msg.from,
//       "Hallo, selamat datang di MANDIRI. Silakan mulai dengan mengetik (*!menu*)."
//     );
//   }
// });

// // Fungsi untuk mengambil data (area, cabang, produk) menggunakan axios
// async function fetchData(type, id = "") {
//   const url = `http://localhost:3000/api/${type}${id ? `/${id}` : ""}`;

//   try {
//     const response = await axios.get(url); // Menggunakan axios.get() untuk request data
//     return response.data.data; // Mengembalikan data yang diambil dari response
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     return []; // Mengembalikan array kosong jika terjadi error
//   }
// }

// client.initialize();
// export default client;
