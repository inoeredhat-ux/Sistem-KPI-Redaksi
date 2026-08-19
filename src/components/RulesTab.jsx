import React from "react";
import { Check, RotateCcw } from "lucide-react";
import { SLATE, LINE, TIERS, DEFAULT_PARAMS, DEFAULT_TARGETS } from "../lib/constants.js";
import { rupiah } from "../lib/format.js";
import { Btn, GradePill } from "./ui.jsx";

const FIELDS = [
  ["wViews", "Bobot viewers"],
  ["wProd", "Bobot produktivitas"],
  ["cWriter", "Kredit untuk penulis"],
  ["cEditor", "Kredit untuk editor"],
  ["cap", "Batas maksimum tiap komponen"],
];

export default function RulesTab({ params, setParams, targets, setTargets, onSave }) {
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
        <div className="mt-4 pt-4 border-t text-[12px] leading-relaxed" style={{ borderColor: "#EEF1F5", color: SLATE }}>
          Bobot viewers dan produktivitas harus berjumlah 100%. Begitu pula kredit penulis dan editor. Batas maksimum
          menjaga agar satu artikel viral tidak memborong seluruh pool reward.
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5" style={{ borderColor: LINE }}>
        <div className="font-semibold text-[14px]">Target bulanan per jabatan</div>
        <table className="w-full mt-3.5 text-[13px]">
          <thead>
            <tr>
              {["Jabatan", "Artikel", "Viewers"].map((h, i) => (
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
                    className="w-28 rounded border px-2 py-1 text-right text-[13px] tnum" style={{ borderColor: LINE }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
          <Btn size="sm" onClick={() => { setParams(DEFAULT_PARAMS); setTargets(DEFAULT_TARGETS); }}>
            <RotateCcw size={13} /> Kembalikan bawaan
          </Btn>
        </div>
      </div>
    </div>
  );
}
