import whatsapp from "whatsapp-web.js";
const { Client, LocalAuth } = whatsapp;
import qrcode from "qrcode-terminal";
import axios from "axios"; // Menggunakan axios untuk mengambil data

// Inisialisasi client WhatsApp menggunakan LocalAuth
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true },
});

// Menampilkan QR code untuk login ke WhatsApp Web (gunakan aplikasi WhatsApp untuk memindai)
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
  else if (userMessage === "!menu") {
    userState[userId] = { stage: "category" }; // Menyimpan status pengguna
    const areas = await fetchData("area"); // Ambil data area dari API

    const message =
      "Selamat datang di MANDIRI. Silahkan pilih Area dengan cara mengetik nomor tujuan:\n" +
      areas.map((area, index) => `${index + 1}. ${area.nama_area}`).join("\n");
    const buttons = areas.map((area, index) => ({
      body: `${index + 1}. ${area.nama_area}`,
    }));

    client.sendMessage(msg.from, message, { buttons });
  }

  // Pilih kategori (Area)
  else if (userState[userId]?.stage === "category") {
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

    const cabangData = await fetchData(`cabang/${selectedArea._id}`);
    const cabangMessage =
      `Silahkan pilih cabang untuk ${selectedArea.nama_area}:\n` +
      cabangData
        .map((cabang, index) => `${index + 1}. ${cabang.nama_cabang}`)
        .join("\n");
    const cabangButtons = cabangData.map((cabang, index) => ({
      body: `${index + 1}. ${cabang.nama_cabang}`,
    }));

    client.sendMessage(msg.from, cabangMessage, { buttons: cabangButtons });
  }

  // Pilih cabang
  else if (userState[userId]?.stage === "branch") {
    const cabangIndex = parseInt(userMessage) - 1; // Index cabang yang dipilih
    const selectedArea = userState[userId].selectedArea;

    const cabangData = await fetchData(`cabang/${selectedArea._id}`);
    if (!cabangData[cabangIndex]) {
      return client.sendMessage(
        msg.from,
        "Cabang yang dipilih tidak valid. Silakan coba lagi."
      );
    }

    function capitalizeFirstLetter(text) {
      return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    }

    const selectedCabang = cabangData[cabangIndex];
    userState[userId].selectedCabang = selectedCabang; // Menyimpan cabang yang dipilih
    userState[userId].stage = "product"; // Ubah ke tahap produk

    const produkData = await fetchData(`produk/${selectedCabang._id}`);
    const produkMessage =
      `Silahkan pilih produk untuk cabang ${selectedCabang.nama_cabang}:\n` +
      produkData
        .map(
          (produk, index) =>
            `${index + 1}. ${capitalizeFirstLetter(produk.nama_produk)}`
        )
        .join("\n");
    const produkButtons = produkData.map((produk, index) => ({
      body: `${index + 1}. ${produk.nama_produk}`,
    }));

    client.sendMessage(msg.from, produkMessage, { buttons: produkButtons });
  }

  // Langkah 4: Pilih produk dan tampilkan detail produk
  else if (userState[userId]?.stage === "product") {
    const produkIndex = parseInt(userMessage) - 1; // Index produk yang dipilih
    const selectedCabang = userState[userId].selectedCabang;

    const produkData = await fetchData(`produk/${selectedCabang._id}`);
    if (!produkData[produkIndex]) {
      return client.sendMessage(
        msg.from,
        "Produk yang dipilih tidak valid. Silakan coba lagi."
      );
    }

    const selectedProduk = produkData[produkIndex];
    function capitalizeFirstLetterOfEachSentence(text) {
      return text.replace(/(?:^|\.\s*)([a-z])/g, (match, p1) =>
        p1.toUpperCase()
      );
    }

    function capitalizeFirstLetter(text) {
      return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    }

    // Menampilkan detail produk beserta actual, commit, target, dan growth
    const produkDetailMessage = `
        *Detail Produk:*
        Nama Produk: ${capitalizeFirstLetter(selectedProduk.nama_produk)}
        Nama Cabang: ${capitalizeFirstLetter(selectedProduk.nama_cabang)}

        *Actual:*
        - 31/01/2024: ${selectedProduk.actual.act_jan_prev || "Tidak tersedia"}
        - 31/12/2024: ${selectedProduk.actual.act_des_prev || "Tidak tersedia"}
        - 25 Jan 2025 - pkl 20.00: ${
          selectedProduk.actual.current_date_before || "Tidak tersedia"
        }
        - 25 Jan 2025 - pkl 17.00: ${
          selectedProduk.actual.current_date_after || "Tidak tersedia"
        }

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
    `;

    const formattedMessage =
      capitalizeFirstLetterOfEachSentence(produkDetailMessage);

    client.sendMessage(msg.from, formattedMessage);

    // Reset state setelah pemilihan produk selesai
    userState[userId] = { stage: "main" }; // Kembali ke awal
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
