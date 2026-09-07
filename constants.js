export const INK = "#12182A";
export const RED = "#D6232B";
export const PAPER = "#F6F7F9";
export const GREEN = "#1F7A5C";
export const AMBER = "#B26B00";
export const SLATE = "#5B677D";
export const LINE = "#DEE3EB";

export const ROLES = [
  "Redaktur Pelaksana",
  "Redaktur",
  "Reporter",
  "Sekretaris Redaksi",
  "Tidak dinilai",
];

/** Jabatan yang produktivitasnya dihitung dari artikel yang disunting, bukan yang ditulis. */
export const EDITOR_ROLES = ["Redaktur Pelaksana", "Redaktur", "Sekretaris Redaksi"];

/**
 * Target bulanan per jabatan.
 *   views  = target viewers web (artikel inilah.com + video on-site)
 *   medsos = target engagement media sosial. Nol berarti jabatan itu tidak
 *            dinilai dari media sosial, dan bobotnya kembali penuh ke viewers web.
 */
export const DEFAULT_TARGETS = {
  "Redaktur Pelaksana": { prod: 350, views: 250000, medsos: 0 },
  Redaktur: { prod: 350, views: 250000, medsos: 0 },
  Reporter: { prod: 200, views: 120000, medsos: 150000 },
  "Sekretaris Redaksi": { prod: 175, views: 150000, medsos: 0 },
};

export const DEFAULT_PARAMS = {
  wViews: 0.6,
  wProd: 0.4,
  cWriter: 0.6,
  cEditor: 0.4,
  cap: 2,
  /**
   * Bobot engagement media sosial, diambil dari porsi viewers.
   * Jabatan yang punya target medsos memakai:
   *   (wViews - wMedsos) untuk viewers web, lalu wMedsos untuk medsos.
   * Jabatan tanpa target medsos memakai wViews penuh, seperti skema semula.
   */
  wMedsos: 0.15,
  /**
   * Bila penulis sebuah artikel berstatus "Tidak dinilai" — misalnya byline
   * Advertorial — porsi kredit penulis dialihkan ke editor yang menaikkan.
   * Editor menerima 100%, bukan 40%, karena tidak ada penulis yang berbagi.
   */
  alihkanKreditPenulis: true,
};

/**
 * Bobot poin produksi video. Satu artikel teks = 1 poin, dipakai sebagai patokan.
 * Angka ditarik dari estimasi jam kerja, bukan perkiraan kasar.
 */
export const DEFAULT_VIDEO_POIN = {
  reels: 1,
  pkg: 2,
  live: 3,
  vind: 4,
  indepth: 1,
};

export const VIDEO_JENIS = [
  { k: "reels", label: "Reels / Shorts", ket: "vertikal, di bawah 90 detik" },
  { k: "pkg", label: "News Package", ket: "1–3 menit, ada voice over atau wawancara" },
  { k: "live", label: "Live Report", ket: "siaran langsung dari lapangan" },
  { k: "vind", label: "Indepth Video", ket: "di atas 5 menit, multi-narasumber" },
];

/**
 * Faktor konversi views media sosial menjadi kredit viewers.
 * Satu view TikTok tidak senilai satu pembaca artikel, karena traffic-nya
 * berada di platform orang lain dan tidak masuk inventori iklan sendiri.
 */
export const DEFAULT_VIDEO_FAKTOR = {
  onsite: 1.0,
  yt: 0.8,
  tt: 0.25,
  ig: 0.25,
  fb: 0.25,
};

/**
 * grup "web"   -> masuk komponen Viewers web, karena traffic-nya di rumah sendiri
 * grup "medsos"-> masuk komponen Engagement medsos
 */
export const VIDEO_PLATFORM = [
  { k: "onsite", label: "Video on-site", ket: "player inilah.com, tonton ≥30 detik", grup: "web" },
  { k: "yt", label: "YouTube", ket: "tonton ≥30 detik atau ≥50% durasi", grup: "medsos" },
  { k: "tt", label: "TikTok", ket: "tuntas atau tonton ≥6 detik", grup: "medsos" },
  { k: "ig", label: "Instagram", ket: "Reels atau video Feed", grup: "medsos" },
  { k: "fb", label: "Facebook", ket: "tonton ≥15 detik", grup: "medsos" },
];

export const PLATFORM_MEDSOS = VIDEO_PLATFORM.filter((p) => p.grup === "medsos");
export const PLATFORM_WEB = VIDEO_PLATFORM.filter((p) => p.grup === "web");

/** Bentuk kosong satu baris entri manual. */
export const MANUAL_KOSONG = {
  ind: 0, reels: 0, pkg: 0, live: 0, vind: 0,
  onsite: 0, yt: 0, tt: 0, ig: 0, fb: 0,
};

export const TIERS = [
  { min: 1.5, grade: "A+", label: "Reward Platinum", reward: 1000000 },
  { min: 1.25, grade: "A", label: "Reward Gold", reward: 750000 },
  { min: 1.1, grade: "B", label: "Reward Silver", reward: 500000 },
  { min: 1.0, grade: "C", label: "Tercapai", reward: 0 },
  { min: 0, grade: "D", label: "Belum tercapai", reward: 0 },
];

export const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const DEFAULT_REPORT = {
  city: "Jakarta",
  bonusOn: true,
  bonusAmount: 500000,
  intro:
    "Berikut kami lampirkan laporan Pencapaian Berita dengan skema penilaian baru, dengan perincian sebagai berikut:",
  closing:
    "Demikian laporan ini saya buat dengan sebenarnya, agar dapat dipergunakan sebagaimana mestinya.",
  signers: [
    { role: "Menyetujui,", name: "Sukarya Wiguna", title: "Pemimpin Redaksi" },
    { role: "Mengetahui,", name: "Olga Novianda", title: "HRD" },
    { role: "Pembuat Laporan,", name: "Mia Umi Kartikawati", title: "Sekretaris Redaksi" },
  ],
};
