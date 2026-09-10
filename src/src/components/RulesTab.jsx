import React from "react";
import { Check, RotateCcw } from "lucide-react";
import {
  SLATE, LINE, INK, TIERS, DEFAULT_PARAMS, DEFAULT_TARGETS,
  DEFAULT_VIDEO_POIN, DEFAULT_VIDEO_FAKTOR, VIDEO_JENIS, VIDEO_PLATFORM, BASIS, ROLES,
} from "../lib/constants.js";
import { rupiah } from "../lib/format.js";
import { Btn, GradePill } from "./ui.jsx";

const FIELDS = [
  ["wViews", "Bobot viewers (web + medsos)"],
  ["wMedsos", "  di antaranya untuk engagement medsos"],
  ["wProd", "Bobot produktivitas"],
  ["cWriter", "Kredit untuk penulis"],
  ["cEditor", "Kredit untuk editor"],
  ["cap", "Batas maksimum tiap komponen"],
];

export default function RulesTab({ params, setParams, targets, setTargets, poin, setPoin, faktor, setFaktor, onSave }) {
  const tersembunyi = Object.keys(targets).filter((r) => targets[r].masukLaporan === false);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="rounded-lg border bg-white p-5" style={{ borderColor: LINE }}>
        <div className="font-semibold text-[14px]">Bobot dan kredit</div>
        <div className="mt-4 space-y-3.5">
          {FIELDS.map(([k, l]) => (
            <div key={k} className="flex items-center justify-between gap-4">
              <label className="text-[13px]">{l}</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number" step="5" min="0"
                  value={Math.round(params[k] * 100)}
                  onChange={(e) => setParams((p) => ({ ...p, [k]: (+e.target.value || 0) / 100 }))}
                  className="w-20 rounded border px-2 py-1.5 text-[13px] text-right tnum"
                  style={{ borderColor: LINE }}
                />
                <span className="text-[13px]" style={{ color: SLATE }}>%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "#EEF1F5" }}>
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={params.alihkanKreditPenulis !== false}
              onChange={(e) => setParams((p) => ({ ...p, alihkanKreditPenulis: e.target.checked }))}
              className="mt-0.5"
              style={{ accentColor: INK }}
            />
            <span className="text-[13px]">
              Alihkan kredit penulis ke editor bila penulis tidak dinilai
              <span className="block text-[11.5px] mt-0.5" style={{ color: SLATE }}>
                Untuk byline seperti Advertorial. Editor menerima 100% kredit viewers, bukan {Math.round(params.cEditor * 100)}%,
                karena tidak ada penulis yang berbagi.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-4 pt-4 border-t text-[12px] leading-relaxed space-y-2" style={{ borderColor: "#EEF1F5", color: SLATE }}>
          <p>
            Bobot viewers dan produktivitas harus berjumlah 100%. Bobot medsos diambil dari porsi viewers,
            bukan ditambahkan di luarnya.
          </p>
          <p>
            Jabatan yang punya target medsos memakai{" "}
            <b style={{ color: INK }}>
              {Math.round((params.wViews - (params.wMedsos || 0)) * 100)}% web + {Math.round((params.wMedsos || 0) * 100)}% medsos + {Math.round(params.wProd * 100)}% produktivitas
            </b>
            . Jabatan tanpa target medsos memakai{" "}
            <b style={{ color: INK }}>{Math.round(params.wViews * 100)}% web + {Math.round(params.wProd * 100)}% produktivitas</b>.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5" style={{ borderColor: LINE }}>
        <div className="font-semibold text-[14px]">Target bulanan per jabatan</div>
        <table className="w-full mt-3.5 text-[13px]">
          <thead>
            <tr>
              {[
                { t: "Jabatan", a: "left" },
                { t: "Dasar produktivitas", a: "center" },
                { t: "Artikel", a: "center" },
                { t: "Viewers web", a: "center" },
                { t: "Target medsos", a: "center" },
                { t: "Laporan", a: "center" },
              ].map((h) => (
                <th
                  key={h.t}
                  className="pb-2 px-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase align-bottom"
                  style={{ color: SLATE, textAlign: h.a, whiteSpace: "nowrap" }}
                >
                  {h.t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(targets)
              // jabatan di luar laporan tidak perlu dikonfigurasi di sini
              .filter((r) => targets[r].masukLaporan !== false)
              .sort((a, b) => {
                const ia = ROLES.indexOf(a), ib = ROLES.indexOf(b);
                return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
              })
              .map((r) => (
              <tr key={r} className="border-t" style={{ borderColor: "#F0F2F6" }}>
                <td className="py-2 pr-2 align-middle">{r}</td>
                <td className="py-2 px-1.5 text-center align-middle">
                  <select
                    value={targets[r].basis || "tulis"}
                    onChange={(e) => setTargets((t) => ({ ...t, [r]: { ...t[r], basis: e.target.value } }))}
                    className="rounded border px-2 py-1 text-[12.5px] bg-white"
                    style={{ borderColor: LINE }}
                    title="Jumlah artikel mana yang dibandingkan dengan target"
                  >
                    {BASIS.map((b) => (
                      <option key={b.k} value={b.k}>{b.label}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-1.5 text-center align-middle">
                  <input type="number" value={targets[r].prod}
                    onChange={(e) => setTargets((t) => ({ ...t, [r]: { ...t[r], prod: +e.target.value || 0 } }))}
                    className="w-20 rounded border px-2 py-1 text-right text-[13px] tnum" style={{ borderColor: LINE }} />
                </td>
                <td className="py-2 px-1.5 text-center align-middle">
                  <input type="number" step="5000" value={targets[r].views}
                    onChange={(e) => setTargets((t) => ({ ...t, [r]: { ...t[r], views: +e.target.value || 0 } }))}
                    className="w-24 rounded border px-2 py-1 text-right text-[13px] tnum" style={{ borderColor: LINE }} />
                </td>
                <td className="py-2 px-1.5 text-center align-middle">
                  <input type="number" step="5000" value={targets[r].medsos || 0}
                    onChange={(e) => setTargets((t) => ({ ...t, [r]: { ...t[r], medsos: +e.target.value || 0 } }))}
                    className="w-24 rounded border px-2 py-1 text-right text-[13px] tnum"
                    style={{ borderColor: LINE, color: (targets[r].medsos || 0) ? INK : "#A6AEBC" }} />
                </td>
                <td className="py-2 px-1.5 text-center align-middle">
                  <input type="checkbox"
                    checked={targets[r].masukLaporan !== false}
                    onChange={(e) => setTargets((t) => ({ ...t, [r]: { ...t[r], masukLaporan: e.target.checked } }))}
                    style={{ accentColor: INK }}
                    title="Centang berarti jabatan ini ikut laporan resmi dan rekap reward" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 text-[11.5px] leading-relaxed space-y-1" style={{ color: SLATE }}>
          <p>
            Target medsos 0 berarti jabatan itu tidak dinilai dari media sosial, dan bobot viewers-nya
            kembali penuh ke web.
          </p>
          <p>
            Kolom Laporan yang tidak dicentang membuat jabatan itu tetap dihitung dan tampil di klasemen,
            tetapi tidak ikut laporan resmi, rekap reward, maupun kartu statistik.
          </p>
          {tersembunyi.length > 0 && (
            <p>
              Tidak ditampilkan di tabel karena penilaiannya diatur terpisah:{" "}
              <b style={{ color: INK }}>{tersembunyi.join(", ")}</b>. Jabatan ini tetap bisa dipilih di
              tab Jabatan dan tetap tampil di klasemen, hanya tidak ikut laporan.
            </p>
          )}
          <p>
            Dasar produktivitas menentukan angka mana yang dibandingkan dengan target artikel.
            Jabatan penyunting biasanya memakai artikel disunting, jabatan penulis memakai artikel ditulis.
            Untuk jabatan peralihan seperti Asisten Redaksi, pilih sesuai porsi kerja yang sebenarnya —
            selisihnya besar terhadap skor akhir.
          </p>
        </div>

        <div className="mt-5 font-semibold text-[14px]">Tabel grade</div>
        <div className="mt-2.5 space-y-1">
          {[...TIERS].reverse().map((t) => (
            <div key={t.grade} className="flex items-center gap-3 text-[13px] py-1">
              <GradePill g={t.grade} />
              <span className="tnum" style={{ color: SLATE }}>
                {t.min === 0 ? "di bawah 100%" : `${(t.min * 100).toFixed(0)}% ke atas`}
              </span>
              <div className="flex-1" />
              <span className="tnum">{rupiah(t.reward)}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <Btn size="sm" variant="solid" onClick={onSave}><Check size={13} /> Simpan pengaturan</Btn>
          <Btn size="sm" onClick={() => {
            setParams(DEFAULT_PARAMS); setTargets(DEFAULT_TARGETS);
            setPoin(DEFAULT_VIDEO_POIN); setFaktor(DEFAULT_VIDEO_FAKTOR);
          }}>
            <RotateCcw size={13} /> Kembalikan bawaan
          </Btn>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5" style={{ borderColor: LINE }}>
        <div className="font-semibold text-[14px]">Poin produksi video dan indepth</div>
        <div className="text-[12px] mt-1" style={{ color: SLATE }}>
          Satu artikel teks = 1 poin, dipakai sebagai patokan.
        </div>
        <div className="mt-3.5 space-y-2.5">
          {[{ k: "indepth", label: "Artikel indepth", ket: "per artikel tambahan" }, ...VIDEO_JENIS].map((v) => (
            <div key={v.k} className="flex items-center justify-between gap-3">
              <div className="text-[13px]">
                {v.label}
                <span className="block text-[11px]" style={{ color: SLATE }}>{v.ket}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number" min="0" step="1"
                  value={poin[v.k]}
                  onChange={(e) => setPoin((p) => ({ ...p, [v.k]: +e.target.value || 0 }))}
                  className="w-16 rounded border px-2 py-1 text-[13px] text-right tnum"
                  style={{ borderColor: LINE }}
                />
                <span className="text-[12px]" style={{ color: SLATE }}>poin</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5" style={{ borderColor: LINE }}>
        <div className="font-semibold text-[14px]">Faktor konversi views media sosial</div>
        <div className="text-[12px] mt-1" style={{ color: SLATE }}>
          Satu view di platform orang lain tidak senilai satu pembaca artikel sendiri.
        </div>
        <div className="mt-3.5 space-y-2.5">
          {VIDEO_PLATFORM.map((pl) => (
            <div key={pl.k} className="flex items-center justify-between gap-3">
              <div className="text-[13px]">
                {pl.label}
                <span className="block text-[11px]" style={{ color: SLATE }}>{pl.ket}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[12px]" style={{ color: SLATE }}>×</span>
                <input
                  type="number" min="0" step="0.05"
                  value={faktor[pl.k]}
                  onChange={(e) => setFaktor((p) => ({ ...p, [pl.k]: +e.target.value || 0 }))}
                  className="w-20 rounded border px-2 py-1 text-[13px] text-right tnum"
                  style={{ borderColor: LINE }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t text-[12px] leading-relaxed" style={{ borderColor: "#EEF1F5", color: SLATE }}>
          Dengan faktor 0,25 dibutuhkan empat view TikTok untuk setara satu pembaca artikel.
          Tanpa pembeda ini, reporter terdorong meninggalkan artikel dan mengejar reels.
        </div>
      </div>
    </div>
  );
}
