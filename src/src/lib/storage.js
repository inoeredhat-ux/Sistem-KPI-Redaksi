/**
 * Penyimpanan pengaturan.
 *
 * Urutan yang dipakai:
 *   1. Server (Redis lewat /api/settings) — semua orang melihat pengaturan yang sama.
 *   2. Peramban (localStorage) — cadangan bila server belum disiapkan atau sedang gagal.
 *
 * Aplikasi tetap berfungsi penuh meski server belum diatur. Dalam kondisi itu
 * pengaturan hanya berlaku di peramban masing-masing, dan status di bagian atas
 * layar akan menunjukkannya.
 */

const KEY = "kpi-redaksi:settings:v1";
const NAMA_KEY = "kpi-redaksi:nama-pengubah";

/* ---------------- peramban ---------------- */

export function loadLocal() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocal(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearLocal() {
  try {
    localStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}

/** Nama pengubah, supaya jejak perubahan terbaca siapa pelakunya. */
export function getNama() {
  try {
    return localStorage.getItem(NAMA_KEY) || "";
  } catch {
    return "";
  }
}

export function setNama(v) {
  try {
    localStorage.setItem(NAMA_KEY, v);
  } catch {
    /* abaikan */
  }
}

/* ---------------- server ---------------- */

/** Ambil pengaturan dari server. */
export async function loadRemote() {
  try {
    const r = await fetch("/api/settings", { cache: "no-store" });
    if (r.status === 503) {
      return { status: "lokal", data: null, pesan: "Penyimpanan server belum disiapkan" };
    }
    if (!r.ok) {
      return { status: "lokal", data: null, pesan: "Server tidak menjawab" };
    }
    return { status: "server", data: await r.json() };
  } catch {
    return { status: "lokal", data: null, pesan: "Tidak ada koneksi ke server" };
  }
}

/** Simpan pengaturan ke server. */
export async function saveRemote(data) {
  try {
    const r = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, updatedBy: getNama() || "tanpa nama" }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, pesan: j.pesan || "Gagal menyimpan ke server" };
    return { ok: true, updatedAt: j.updatedAt };
  } catch {
    return { ok: false, pesan: "Tidak ada koneksi ke server" };
  }
}

/** Cek apakah ada perubahan lebih baru di server, tanpa menimpa layar. */
export async function cekPerubahan(sejak) {
  const { status, data } = await loadRemote();
  if (status !== "server" || !data?.updatedAt) return null;
  if (sejak && data.updatedAt <= sejak) return null;
  return data;
}

/* ---------------- berkas JSON ---------------- */

export function simpanKeBerkas(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pengaturan-kpi-redaksi.json";
  a.click();
  URL.revokeObjectURL(url);
}

export async function muatDariBerkas(file) {
  return JSON.parse(await file.text());
}
