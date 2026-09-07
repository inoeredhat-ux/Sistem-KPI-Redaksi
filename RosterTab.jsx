import React from "react";
import { Check, Download, Upload as UpIcon, RotateCcw } from "lucide-react";
import { SLATE, LINE, ROLES, INK } from "../lib/constants.js";
import { Btn } from "./ui.jsx";

export default function RosterTab({ names, roster, setRoster, onSave, onExportCfg, onImportCfg, onReset }) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: LINE }}>
      <div className="px-4 py-3.5 border-b flex flex-wrap items-center gap-3" style={{ borderColor: "#EEF1F5" }}>
        <div>
          <div className="font-semibold text-[14px]">Jabatan tiap nama</div>
          <div className="text-[12px] mt-0.5" style={{ color: SLATE }}>
            Atur sekali, tersimpan untuk unggahan berikutnya. Pilih “Tidak dinilai” untuk byline seperti Advertorial atau kontributor tamu.
          </div>
        </div>
        <div className="flex-1" />
        <Btn size="sm" onClick={onExportCfg}><Download size={13} /> Ekspor pengaturan</Btn>
        <label className="inline-flex items-center gap-2 rounded-md border text-xs px-2.5 py-1.5 cursor-pointer bg-white hover:bg-black/[0.02]"
          style={{ borderColor: LINE, color: INK }}>
          <UpIcon size={13} /> Impor
          <input type="file" accept=".json" className="hidden"
            onChange={(e) => e.target.files?.[0] && onImportCfg(e.target.files[0])} />
        </label>
        <Btn size="sm" onClick={onReset}><RotateCcw size={13} /> Reset</Btn>
        <Btn size="sm" variant="solid" onClick={onSave}><Check size={13} /> Simpan</Btn>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#FAFBFC" }}>
              {["Nama", "Ditulis", "Disunting", "Jabatan"].map((h, i) => (
                <th key={h} className="px-3 py-2 text-[10px] font-semibold tracking-[0.1em] uppercase"
                  style={{ color: SLATE, textAlign: i === 0 || i === 3 ? "left" : "right" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...names].sort((a, b) => b.w + b.e - (a.w + a.e)).map(({ n, w, e }) => (
              <tr key={n} className="border-t" style={{ borderColor: "#F0F2F6" }}>
                <td className="px-3 py-2 font-medium">{n}</td>
                <td className="px-3 py-2 text-right tnum" style={{ color: SLATE }}>{w || "—"}</td>
                <td className="px-3 py-2 text-right tnum" style={{ color: SLATE }}>{e || "—"}</td>
                <td className="px-3 py-2">
                  <select
                    value={roster[n] || "Reporter"}
                    onChange={(ev) => setRoster((p) => ({ ...p, [n]: ev.target.value }))}
                    className="rounded border px-2 py-1 text-[12.5px] bg-white"
                    style={{ borderColor: LINE, color: roster[n] === "Tidak dinilai" ? SLATE : INK }}
                  >
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
