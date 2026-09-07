import * as XLSX from "xlsx";
import { iso } from "./format.js";

/** Cari nama kolom yang mengandung salah satu kata kunci. */
function pick(headers, keys) {
  for (const k of keys) {
    const hit = headers.find((h) =>
      String(h).toLowerCase().replace(/[\s_-]/g, "").includes(k)
    );
    if (hit) return hit;
  }
  return null;
}

function toDate(v) {
  if (v instanceof Date) return v;
  if (typeof v === "number") {
    const p = XLSX.SSF.parse_date_code(v);
    return p ? new Date(p.y, p.m - 1, p.d, p.H || 0, p.M || 0) : null;
  }
  const s = String(v || "").trim();
  if (!s) return null;
  // dd/mm/yyyy atau dd-mm-yyyy
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  const d = new Date(s.replace(" ", "T"));
  return isNaN(d) ? null : d;
}

/**
 * Ubah baris mentah hasil sheet_to_json menjadi daftar artikel yang seragam.
 * Nama kolom dikenali otomatis, urutan kolom bebas.
 */
export function parseRows(rows) {
  if (!rows.length) return { articles: [], map: {}, headers: [] };
  const headers = Object.keys(rows[0]);
  const map = {
    date: pick(headers, ["publishedat", "publishdate", "tanggal", "tayang", "date", "waktu"]),
    author: pick(headers, ["author", "penulis", "reporter", "byline"]),
    editor: pick(headers, ["editor", "redaktur", "penyunting"]),
    views: pick(headers, ["viewcount", "views", "pageview", "pembaca", "dibaca"]),
    title: pick(headers, ["title", "judul", "headline"]),
  };

  const articles = rows
    .map((r, i) => {
      const dt = map.date ? toDate(r[map.date]) : null;
      const raw = map.views ? r[map.views] : 0;
      const views =
        typeof raw === "number"
          ? raw
          : parseInt(String(raw).replace(/[^\d]/g, ""), 10) || 0;
      return {
        id: i,
        date: dt,
        day: dt ? iso(dt) : "",
        author: map.author ? String(r[map.author] ?? "").trim() : "",
        editor: map.editor ? String(r[map.editor] ?? "").trim() : "",
        views,
        title: map.title ? String(r[map.title] ?? "").trim() : "(tanpa judul)",
      };
    })
    .filter((a) => a.author || a.editor);

  return { articles, map, headers };
}

/** Baca File dari input/drag-drop menjadi daftar artikel. */
export async function readFile(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
  return parseRows(rows);
}
