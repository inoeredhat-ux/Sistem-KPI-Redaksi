import React, { useState, useMemo } from "react";
import { Check, Video, FileStack, Eraser } from "lucide-react";
import {
  SLATE, LINE, INK, GREEN,
  VIDEO_JENIS, VIDEO_PLATFORM, MANUAL_KOSONG,
} from "../lib/constants.js";
import { nf, pct } from "../lib/format.js";
import { Btn } from "./ui.jsx";

const NumCell = ({ value, onChange, w = "w-[62px]" }) => (
  <input
    type="number"
    min="0"
    value={value || ""}
    placeholder="0"
    onChange={(e) => onChange(Math.max(0, +e.target.value || 0))}
    className={`${w} rounded border px-1.5 py-1 text-[12.5px] text-right tnum`}
    style={{ borderColor: LINE }}
  />
);

export default function ManualTab({
  results, manual, setManual, periodKey, periodLabel, poin, faktor, onSave,
}) {
  const [hanyaTerisi, setHanyaTerisi] = useState(false);

  const set = (nama, key, val) =>
    setManual((p) => ({
      ...p,
      [nama]: { ...MANUAL_KOSONG, ...(p[nama] || {}), [key]: val },
    }));

  const kosongkan = (nama) =>
    setManual((p) => {
      const next = { ...p };
      delete next[nama];
      return next;
    });

  const baris = useMemo(() => {
    const l = results.map((r) => ({ r, m: { ...MANUAL_KOSONG, ...(manual[r.name] || {}) } }));
    return hanyaTerisi ? l.filter(({ r }) => r.adaManual) : l;
  }, [results, manual, hanyaTerisi]);

  const totalPoin = results.reduce((s, r) => s + r.poinIndepth + r.poinVideo, 0);
  const totalKredit = results.reduce((s, r) => s + r.kreditVideo, 0);
  const terisi = results.filter((r) => r.adaManual).length;

  const Head = ({ children, span, warna }) => (
    <th
      colSpan={span}
      className="px-2 py-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase text-center border-b"
      style={{ color: warna || SLATE, borderColor: LINE }}
    >
      {children}
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4" style={{ borderColor: LINE }}>
        <div className="flex flex-wrap items-start gap-3">
          <div>
            <div className="font-semibold text-[14px]">
              Tambahan manual — {periodLabel || periodKey}
            </div>
            <div className="text-[12px] mt-1 max-w-[640px] leading-relaxed" style={{ color: SLATE }}>
              Untuk hal yang tidak terbaca dari CMS: artikel indepth yang ditulis lebih dari satu
              reporter, dan produksi video yang tayang di media sosial. Angka tersimpan per periode,
              jadi bulan berikutnya dimulai dari kosong.
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[12.5px] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hanyaTerisi}
                onChange={(e) => setHanyaTerisi(e.target.checked)}
                style={{ accentColor: INK }}
              />
              Hanya yang terisi
            </label>
            <Btn size="sm" variant="solid" onClick={onSave}><Check size={13} /> Simpan</Btn>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t flex flex-wrap gap-x-6 gap-y-1 text-[12px]" style={{ borderColor: "#EEF1F5" }}>
          <span style={{ color: SLATE }}>
            Terisi: <b style={{ color: INK }}>{terisi} orang</b>
          </span>
          <span style={{ color: SLATE }}>
            Tambahan poin produktivitas: <b style={{ color: GREEN }}>+{nf.format(totalPoin)}</b>
          </span>
          <span style={{ color: SLATE }}>
            Tambahan kredit viewers: <b style={{ color: GREEN }}>+{nf.format(totalKredit)}</b>
          </span>
        </div>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: LINE }}>
        <div className="overflow-x-auto">
          <table className="text-[12.5px] min-w-[1080px]">
            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                <Head span={1}>&nbsp;</Head>
                <Head span={1}>Indepth</Head>
                <Head span={4}>Jumlah video diproduksi</Head>
                <Head span={5}>Views video per platform</Head>
                <Head span={2}>Hasil</Head>
                <Head span={1}>&nbsp;</Head>
              </tr>
              <tr style={{ background: "#FAFBFC" }}>
                <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-[0.08em] uppercase sticky left-0"
                  style={{ color: SLATE, background: "#FAFBFC" }}>Nama</th>
                <th className="px-2 py-2 text-[10px] font-semibold uppercase" style={{ color: SLATE }}
                  title={`1 artikel indepth = ${poin.indepth} poin`}>Artikel</th>
                {VIDEO_JENIS.map((v) => (
                  <th key={v.k} className="px-2 py-2 text-[10px] font-semibold uppercase whitespace-nowrap"
                    style={{ color: SLATE }} title={`${v.ket} — ${poin[v.k]} poin per video`}>
                    {v.label.split(" ")[0]}
                    <span className="block font-normal normal-case text-[9.5px] opacity-70">{poin[v.k]} poin</span>
                  </th>
                ))}
                {VIDEO_PLATFORM.map((pl) => (
                  <th key={pl.k} className="px-2 py-2 text-[10px] font-semibold uppercase whitespace-nowrap"
                    style={{ color: SLATE }} title={`${pl.ket} — faktor ${faktor[pl.k]}`}>
                    {pl.label.split(" ")[0]}
                    <span className="block font-normal normal-case text-[9.5px] opacity-70">×{faktor[pl.k]}</span>
                  </th>
                ))}
                <th className="px-2 py-2 text-[10px] font-semibold uppercase" style={{ color: SLATE }}>+Poin</th>
                <th className="px-2 py-2 text-[10px] font-semibold uppercase" style={{ color: SLATE }}>+Kredit</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {baris.map(({ r, m }) => (
                <tr key={r.name} className="border-t" style={{ borderColor: "#F0F2F6" }}>
                  <td className="px-3 py-1.5 sticky left-0 bg-white whitespace-nowrap">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-[10.5px]" style={{ color: SLATE }}>{r.role}</div>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <NumCell value={m.ind} onChange={(v) => set(r.name, "ind", v)} w="w-[54px]" />
                  </td>
                  {VIDEO_JENIS.map((v) => (
                    <td key={v.k} className="px-2 py-1.5 text-center">
                      <NumCell value={m[v.k]} onChange={(x) => set(r.name, v.k, x)} w="w-[54px]" />
                    </td>
                  ))}
                  {VIDEO_PLATFORM.map((pl) => (
                    <td key={pl.k} className="px-2 py-1.5 text-center">
                      <NumCell value={m[pl.k]} onChange={(x) => set(r.name, pl.k, x)} w="w-[78px]" />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-right tnum font-semibold"
                    style={{ color: r.poinIndepth + r.poinVideo ? GREEN : "#C3CAD6" }}>
                    {r.poinIndepth + r.poinVideo ? "+" + nf.format(r.poinIndepth + r.poinVideo) : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-right tnum font-semibold"
                    style={{ color: r.kreditVideo ? GREEN : "#C3CAD6" }}>
                    {r.kreditVideo ? "+" + nf.format(r.kreditVideo) : "—"}
                  </td>
                  <td className="px-2 py-1.5">
                    {r.adaManual && (
                      <button type="button" onClick={() => kosongkan(r.name)}
                        title="Kosongkan baris ini" className="p-1 rounded hover:bg-black/5">
                        <Eraser size={13} style={{ color: SLATE }} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!baris.length && (
          <div className="px-4 py-10 text-center text-[13px]" style={{ color: SLATE }}>
            Belum ada entri manual pada periode ini.
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white p-4" style={{ borderColor: LINE }}>
          <div className="flex items-center gap-2 font-semibold text-[13.5px]">
            <FileStack size={15} style={{ color: SLATE }} /> Artikel indepth
          </div>
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: SLATE }}>
            CMS hanya mencatat satu penulis per artikel. Untuk indepth yang dikerjakan beberapa
            reporter, isikan jumlah artikel di kolom Indepth bagi reporter yang tidak tercatat
            sebagai byline. Satu artikel menambah {poin.indepth} poin produktivitas.
          </p>
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: SLATE }}>
            Kolom ini sengaja tidak menambah kredit viewers, karena views artikel tersebut sudah
            dihitung untuk byline yang tercatat. Menambahkannya lagi berarti satu artikel dihitung
            dua kali.
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4" style={{ borderColor: LINE }}>
          <div className="flex items-center gap-2 font-semibold text-[13.5px]">
            <Video size={15} style={{ color: SLATE }} /> Produksi video
          </div>
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: SLATE }}>
            Video dihitung dua arah. Jumlah video yang diproduksi menambah poin produktivitas
            sesuai beban kerjanya. Views di media sosial menambah kredit viewers setelah dikalikan
            faktor platform.
          </p>
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: SLATE }}>
            Isi views dengan angka mentah dari analytics tiap platform. Konversinya dikerjakan
            aplikasi. Bobot poin dan faktor platform dapat diubah di tab Aturan.
          </p>
        </div>
      </div>
    </div>
  );
}
