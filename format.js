import { BULAN, TIERS } from "./constants.js";

export const nf = new Intl.NumberFormat("id-ID");
export const pct = (v) => (v * 100).toFixed(1) + "%";
export const rupiah = (v) => (v ? "Rp " + nf.format(v) : "—");

export const gradeOf = (score) =>
  TIERS.find((t) => score >= t.min) || TIERS[TIERS.length - 1];

/** Date -> "YYYY-MM-DD" pada zona waktu lokal, bukan UTC. */
export function iso(d) {
  if (!d) return "";
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}

/** "2026-08-17" -> "17 Agu 2026" */
export function dLabel(s) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  const pendek = BULAN.map((b) => b.slice(0, 3));
  return `${+d} ${pendek[+m - 1]} ${y}`;
}

export function todayLabel() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}
