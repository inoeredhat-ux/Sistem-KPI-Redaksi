import React from "react";
import { Check, RotateCcw } from "lucide-react";
import {
  SLATE, LINE, INK, TIERS, DEFAULT_PARAMS, DEFAULT_TARGETS,
  DEFAULT_VIDEO_POIN, DEFAULT_VIDEO_FAKTOR, VIDEO_JENIS, VIDEO_PLATFORM,
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
              {["Jabatan", "Artikel", "Viewers web", "Target medsos"].map((h, i) => (
                <th key={h} className="pb-2 text-[10px] font-semibold tracking-[0.1em] uppercase"
                  style={{ color: SLATE, textAlign: i ? "right" : "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(targets).map((r) => (
              <tr key={r} className="border-t" style={{ borderColor: "#F0F2F6" }}>
                <td className="py-2 pr-2">{r}</td>
                <td className="py-2 text-right">
                  <input type="number" value={targets[r].prod}
                    onChange={(e) => setTargets((t) => ({ ...t, [r]: { ...t[r], prod: +e.target.value || 0 } }))}
                    className="w-20 rounded border px-2 py-1 text-right text-[13px] tnum" style={{ borderColor: LINE }} />
                </td>
                <td className="py-2 text-right pl-2">
                  <input type="number" step="5000" value={targets[r].views}
                    onChange={(e) => setTargets((t) => ({ ...t, [r]: { ...t[r], views: +e.target.value || 0 } }))}
                    className="w-24 rounded border px-2 py-1 text-right text-[13px] tnum" style={{ borderColor: LINE }} />
                </td>
                <td className="py-2 text-right pl-2">
                  <input type="number" step="5000" value={targets[r].medsos || 0}
                    onChange={(e) => setTargets((t) => ({ ...t, [r]: { ...t[r], medsos: +e.target.value || 0 } }))}
                    className="w-24 rounded border px-2 py-1 text-right text-[13px] tnum"
                    style={{ borderColor: LINE, color: (targets[r].medsos || 0) ? INK : "#A6AEBC" }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 text-[11.5px] leading-relaxed" style={{ color: SLATE }}>
          Target medsos 0 berarti jabatan itu tidak dinilai dari media sosial, dan bobot viewers-nya
          kembali penuh ke web.
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
