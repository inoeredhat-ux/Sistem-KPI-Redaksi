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

export const DEFAULT_TARGETS = {
  "Redaktur Pelaksana": { prod: 350, views: 250000 },
  Redaktur: { prod: 350, views: 250000 },
  Reporter: { prod: 200, views: 200000 },
  "Sekretaris Redaksi": { prod: 175, views: 150000 },
};

export const DEFAULT_PARAMS = {
  wViews: 0.6,
  wProd: 0.4,
  cWriter: 0.6,
  cEditor: 0.4,
  cap: 2,
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
