/**
 * Penyimpanan pengaturan.
 *
 * Sengaja memakai localStorage, bukan basis data. Alasannya: pengaturan di sini
 * (jabatan, target, bobot, penanda tangan) hanya berubah beberapa kali setahun
 * dan dipakai satu-dua orang. Basis data akan menambah kebutuhan autentikasi,
 * biaya hosting, dan titik kegagalan baru tanpa manfaat yang sepadan.
 *
 * Untuk berbagi pengaturan antar-komputer, pakai simpanKeBerkas() dan
 * muatDariBerkas() — hasilnya satu file JSON kecil yang bisa dikirim lewat chat.
 */

const KEY = "kpi-redaksi:settings:v1";

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}

/** Unduh seluruh pengaturan sebagai file JSON. */
export function simpanKeBerkas(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pengaturan-kpi-redaksi.json";
  a.click();
  URL.revokeObjectURL(url);
}

/** Baca file JSON pengaturan yang dipilih pengguna. */
export async function muatDariBerkas(file) {
  const text = await file.text();
  return JSON.parse(text);
}
