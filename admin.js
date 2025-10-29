// === KONFIGURASI JSONBIN ===
const BIN_PRODUCTS = "6901673443b1c97be988af5c";
const BIN_PRICES = "69016b77ae596e708f34751c";
const BIN_USERS = "6901583b43b1c97be9887dd7";
const BIN_REKENING = "6901807043b1c97be988e00f"; // 🏦 GANTI sesuai bin rekening kamu
const API_KEY = "$2a$10$0anQ3oYLmC5xQJJti0cpMOC9GT3eb1zXjzykbd5Jz92u3qrYuT3F2";
const BASE_URL = "https://api.jsonbin.io/v3/b/";

// === UTILITAS ===
async function fetchBin(id) {
  const res = await fetch(`${BASE_URL}${id}/latest`, {
    headers: { "X-Master-Key": API_KEY },
  });
  const data = await res.json();
  return data.record;
}

async function updateBin(id, record) {
  await fetch(`${BASE_URL}${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Master-Key": API_KEY },
    body: JSON.stringify(record),
  });
}

// === NAVIGASI TAB ===
const tabBtns = document.querySelectorAll(".admin-nav button");
const tabs = document.querySelectorAll(".tab");
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabs.forEach((t) => t.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// === 💰 HARGA EMAS ===
async function loadHarga() {
  const data = await fetchBin(BIN_PRICES);
  const tbody = document.querySelector("#hargaTable tbody");
  tbody.innerHTML = "";
  (data.harga || []).forEach((h, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${h.gram}</td>
      <td><input type="number" class="editable" id="hargaEdit${i}" value="${h.price}"></td>
      <td>
        <button onclick="saveHarga(${i})">💾 Simpan</button>
        <button onclick="deleteHarga(${i})">🗑️ Hapus</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function saveHarga(index) {
  const data = await fetchBin(BIN_PRICES);
  const val = parseInt(document.getElementById(`hargaEdit${index}`).value);
  if (isNaN(val)) return alert("Masukkan angka valid!");
  data.harga[index].price = val;
  await updateBin(BIN_PRICES, data);
  alert("Harga diperbarui!");
}

async function deleteHarga(index) {
  if (!confirm("Yakin ingin menghapus data harga ini?")) return;
  const data = await fetchBin(BIN_PRICES);
  data.harga.splice(index, 1);
  await updateBin(BIN_PRICES, data);
  alert("Data harga dihapus!");
  loadHarga();
}

document.getElementById("addHargaBtn").addEventListener("click", async () => {
  const gram = document.getElementById("hargaGram").value.trim();
  const price = parseInt(document.getElementById("hargaValue").value);
  if (!gram || !price) return alert("Isi semua kolom!");
  const data = await fetchBin(BIN_PRICES);
  data.harga = data.harga || [];
  const existing = data.harga.find((h) => h.gram === gram);
  if (existing) existing.price = price;
  else data.harga.push({ gram, price });
  await updateBin(BIN_PRICES, data);
  loadHarga();
});

// === 📦 PRODUK ===
async function loadProduk() {
  const data = await fetchBin(BIN_PRODUCTS);
  const tbody = document.querySelector("#produkTable tbody");
  tbody.innerHTML = "";
  (data.products || []).forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td><input type="number" id="produkEdit${i}" value="${p.price}"></td>
      <td>
        <img src="${p.image}" width="60"><br>
        <input type="text" id="produkImg${i}" value="${p.image}">
      </td>
      <td>
        <button onclick="saveProduk(${i})">💾</button>
        <button onclick="deleteProduk(${i})">🗑️</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function saveProduk(index) {
  const data = await fetchBin(BIN_PRODUCTS);
  const newPrice = parseInt(document.getElementById(`produkEdit${index}`).value);
  const newImg = document.getElementById(`produkImg${index}`).value.trim();
  if (isNaN(newPrice) || !newImg) return alert("Isi harga & URL gambar!");
  data.products[index].price = newPrice;
  data.products[index].image = newImg;
  await updateBin(BIN_PRODUCTS, data);
  alert("Produk diperbarui!");
  loadProduk();
}

async function deleteProduk(index) {
  if (!confirm("Yakin ingin menghapus produk ini?")) return;
  const data = await fetchBin(BIN_PRODUCTS);
  const deleted = data.products[index];
  data.products.splice(index, 1);
  await updateBin(BIN_PRODUCTS, data);
  alert(`Produk "${deleted.name}" dihapus.`);
  loadProduk();
}

document.getElementById("addProdukBtn").addEventListener("click", async () => {
  const name = document.getElementById("produkName").value.trim();
  const price = parseInt(document.getElementById("produkPrice").value);
  const image = document.getElementById("produkImage").value.trim();
  if (!name || !price || !image) return alert("Isi semua kolom produk!");
  const data = await fetchBin(BIN_PRODUCTS);
  data.products = data.products || [];
  const existing = data.products.find((p) => p.name === name);
  if (existing) Object.assign(existing, { price, image });
  else data.products.push({ name, price, image });
  await updateBin(BIN_PRODUCTS, data);
  loadProduk();
});

// === 🧾 PESANAN ===
async function loadOrders() {
  const data = await fetchBin(BIN_USERS);
  const list = document.getElementById("orderList");
  list.innerHTML = "";
  (data.users || []).forEach((u) => {
    (u.orders || []).forEach((o, i) => {
      const div = document.createElement("div");
      div.className = "order-card";
      div.innerHTML = `
        <strong>${u.name}</strong> (${u.email})<br>
        <small>${o.date}</small><br>
        <b>Status:</b> ${o.status}<br>
        ${o.items.map(it => `${it.name} - Rp ${it.price.toLocaleString("id-ID")}`).join("<br>")}
        <p><b>Total:</b> Rp ${o.total.toLocaleString("id-ID")}</p>
        <button onclick="updateOrderStatus('${u.email}', ${i}, 'Selesai')">✅ Selesai</button>
        <button onclick="updateOrderStatus('${u.email}', ${i}, 'Dibatalkan')">❌ Batal</button>`;
      list.appendChild(div);
    });
  });
}

async function updateOrderStatus(email, index, status) {
  if (!confirm(`Ubah status jadi "${status}"?`)) return;
  const data = await fetchBin(BIN_USERS);
  const user = data.users.find((u) => u.email === email);
  if (!user) return alert("User tidak ditemukan!");
  user.orders[index].status = status;
  await updateBin(BIN_USERS, data);
  alert("Status pesanan diperbarui!");
  loadOrders();
}

// === 👥 PENGGUNA ===
async function loadUsers() {
  const data = await fetchBin(BIN_USERS);
  const list = document.getElementById("userList");
  list.innerHTML = "";
  (data.users || []).forEach((u) => {
    const div = document.createElement("div");
    div.className = "user-card";
    div.innerHTML = `
      <h3>${u.name}</h3>
      <p>📧 ${u.email}</p>
      <p>📞 ${u.phone || "-"}</p>
      <p><b>Alamat:</b> ${u.alamat || "-"}</p>
      <p><b>Pesanan:</b> ${u.orders ? u.orders.length : 0}</p>`;
    list.appendChild(div);
  });
}

// === 🏦 REKENING PEMBAYARAN ===
async function loadRekening() {
  try {
    const res = await fetch(`${BASE_URL}${BIN_REKENING}/latest`, {
      headers: { "X-Master-Key": API_KEY },
    });
    const data = await res.json();
    const r = data.record.rekening || {};
    document.getElementById("rekBank").value = r.bank || "";
    document.getElementById("rekNama").value = r.nama || "";
    document.getElementById("rekNomor").value = r.nomor || "";
    document.getElementById("rekNote").value = r.catatan || "";
  } catch (err) {
    console.error("Gagal memuat rekening:", err);
    alert("Tidak dapat memuat data rekening!");
  }
}

document.getElementById("saveRekeningBtn").addEventListener("click", async () => {
  const bank = document.getElementById("rekBank").value.trim();
  const nama = document.getElementById("rekNama").value.trim();
  const nomor = document.getElementById("rekNomor").value.trim();
  const catatan = document.getElementById("rekNote").value.trim();

  if (!bank || !nama || !nomor) {
    alert("Lengkapi semua kolom rekening!");
    return;
  }

  const record = { rekening: { bank, nama, nomor, catatan } };

  try {
    const res = await fetch(`${BASE_URL}${BIN_REKENING}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
      },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error("Gagal update rekening");
    alert("Rekening berhasil diperbarui!");
    loadRekening();
  } catch (err) {
    console.error("Gagal menyimpan rekening:", err);
    alert("Terjadi kesalahan saat menyimpan rekening.");
  }
});

// === LOGOUT ===
document.getElementById("logoutBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});

// === INISIALISASI ===
loadHarga();
loadProduk();
loadOrders();
loadUsers();
loadRekening();
