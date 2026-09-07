import React, { useState } from "react";
import { Upload } from "lucide-react";
import { SLATE, LINE, RED } from "../lib/constants.js";

const KOLOM = [
  ["Tanggal tayang", "published_at, tanggal, date"],
  ["Penulis", "author, penulis, byline"],
  ["Editor", "editor, redaktur, penyunting"],
  ["Jumlah views", "view_count, views, pageview"],
  ["Judul", "title, judul, headline"],
];

export default function UploadZone({ onFile, busy, fileRef }) {
  const [drag, setDrag] = useState(false);
  return (
    <div className="py-8">
      <div className="max-w-[620px]">
        <h1 className="text-[34px] leading-[1.12] font-extrabold tracking-tight font-display">
          Unggah export CMS,
          <br />
          laporan langsung jadi.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: SLATE }}>
          Pilih periode mingguan atau bulanan, atur jabatan sekali saja, lalu unduh klasemennya.
          Perhitungan mengikuti rumus 60% viewers dan 40% produktivitas.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0]); }}
        onClick={() => fileRef.current?.click()}
        className="mt-7 rounded-xl border-2 border-dashed cursor-pointer transition-colors px-6 py-14 text-center bg-white"
        style={{ borderColor: drag ? RED : LINE }}
      >
        <Upload size={26} strokeWidth={1.7} style={{ color: drag ? RED : SLATE }} className="mx-auto" />
        <div className="mt-3 text-[15px] font-semibold">
          {busy ? "Membaca file…" : "Letakkan file di sini, atau klik untuk memilih"}
        </div>
        <div className="mt-1.5 text-[13px]" style={{ color: SLATE }}>
          Format .xlsx, .xls, atau .csv
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-white p-5" style={{ borderColor: LINE }}>
        <div className="text-[11px] font-semibold tracking-[0.13em] uppercase" style={{ color: SLATE }}>
          Kolom yang dibaca
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
          {KOLOM.map(([a, b]) => (
            <div key={a} className="flex justify-between gap-4 py-1 border-b" style={{ borderColor: "#EEF1F5" }}>
              <span className="font-medium">{a}</span>
              <span className="font-mono text-[11.5px]" style={{ color: SLATE }}>{b}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12.5px]" style={{ color: SLATE }}>
          Nama kolom dikenali otomatis. Urutan kolom bebas.
        </p>
      </div>
    </div>
  );
}
