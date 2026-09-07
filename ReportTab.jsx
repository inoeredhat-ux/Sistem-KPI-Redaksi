import React from "react";
import { Printer, Download, Check } from "lucide-react";
import { SLATE, LINE, INK } from "../lib/constants.js";
import { nf, pct, todayLabel } from "../lib/format.js";
import { Btn } from "./ui.jsx";

const TH = ["No", "Karyawan", "Jabatan", "Dihitung", "Target", "% Prod",
  "Kredit Viewers", "Target", "% Views", "Skor", "Grade", "Keterangan", "Reward"];

export default function ReportTab({
  results, totals, report, setReport, notes, setNotes,
  periodLabel, topViewer, recap, params, onExport, onSave,
}) {
  const sorted = [...results].sort((a, b) => a.name.localeCompare(b.name, "id"));
  const bd = { borderColor: "#D3D9E2" };
  const bh = { borderColor: "#B9C1CE" };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4">
      {/* ---------- pratinjau ---------- */}
      <div className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: LINE }}>
        <div className="px-4 py-3 border-b flex flex-wrap items-center gap-2 no-print" style={{ borderColor: "#EEF1F5" }}>
          <div className="font-semibold text-[14px]">Pratinjau laporan</div>
          <div className="flex-1" />
          <Btn size="sm" onClick={() => window.print()}><Printer size={13} /> Cetak</Btn>
          <Btn size="sm" variant="solid" onClick={onExport}><Download size={13} /> Unduh laporan .xlsx</Btn>
        </div>

        <div id="cetak" className="p-6 overflow-x-auto">
          <div className="text-center mb-4">
            <div className="text-[15px] font-bold font-display">
              LAPORAN PENCAPAIAN BERITA &amp; KPI REDAKSI
            </div>
            <div className="text-[12px] font-semibold mt-1">
              PERIODE : {periodLabel} | Skema {pct(params.wViews)} Viewers + {pct(params.wProd)} Produktivitas
            </div>
          </div>
          <p className="text-[11.5px] mb-3">{report.intro}</p>

          <table className="w-full text-[10.5px] border-collapse">
            <thead>
              <tr>
                {TH.map((h) => (
                  <th key={h} className="border px-1.5 py-1 font-semibold" style={{ ...bh, background: "#F0F2F6" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={r.name}>
                  <td className="border px-1.5 py-1 text-center" style={bd}>{i + 1}</td>
                  <td className="border px-1.5 py-1 whitespace-nowrap" style={bd}>{r.name}</td>
                  <td className="border px-1.5 py-1 whitespace-nowrap" style={bd}>{r.role}</td>
                  <td className="border px-1.5 py-1 text-center tnum" style={bd}>{nf.format(r.count)}</td>
                  <td className="border px-1.5 py-1 text-center tnum" style={bd}>{nf.format(Math.round(r.tProd))}</td>
                  <td className="border px-1.5 py-1 text-center tnum" style={bd}>{pct(r.pProd)}</td>
                  <td className="border px-1.5 py-1 text-right tnum" style={bd}>{nf.format(r.credit)}</td>
                  <td className="border px-1.5 py-1 text-right tnum" style={bd}>{nf.format(Math.round(r.tViews))}</td>
                  <td className="border px-1.5 py-1 text-center tnum" style={bd}>{pct(r.pViews)}</td>
                  <td className="border px-1.5 py-1 text-center tnum font-semibold" style={bd}>{pct(r.score)}</td>
                  <td className="border px-1.5 py-1 text-center font-bold" style={bd}>{r.grade}</td>
                  <td className="border px-1.5 py-1 whitespace-nowrap" style={bd}>{r.label.toUpperCase()}</td>
                  <td className="border px-1.5 py-1 text-right tnum" style={bd}>{r.reward ? nf.format(r.reward) : "—"}</td>
                </tr>
              ))}
              <tr className="font-semibold" style={{ background: "#F0F2F6" }}>
                <td className="border px-1.5 py-1" colSpan={3} style={bh}>Total Keseluruhan</td>
                <td className="border px-1.5 py-1 text-center tnum" style={bh}>
                  {nf.format(results.reduce((s, r) => s + r.count, 0))}
                </td>
                <td className="border px-1.5 py-1" style={bh} />
                <td className="border px-1.5 py-1" style={bh} />
                <td className="border px-1.5 py-1 text-right tnum" style={bh}>
                  {nf.format(results.reduce((s, r) => s + r.credit, 0))}
                </td>
                <td className="border px-1.5 py-1" style={bh} />
                <td className="border px-1.5 py-1" style={bh} />
                <td className="border px-1.5 py-1 text-center tnum" style={bh}>{pct(totals.avg)}</td>
                <td className="border px-1.5 py-1" style={bh} />
                <td className="border px-1.5 py-1" style={bh}>SKOR REDAKSI</td>
                <td className="border px-1.5 py-1 text-right tnum" style={bh}>{nf.format(recap.tierTotal)}</td>
              </tr>
              {report.bonusOn && topViewer && (
                <tr>
                  <td className="border px-1.5 py-1" colSpan={12} style={bd}>
                    Bonus Top Viewers ({topViewer.name} — {nf.format(topViewer.credit)} kredit viewers)
                  </td>
                  <td className="border px-1.5 py-1 text-right tnum" style={bd}>{nf.format(report.bonusAmount)}</td>
                </tr>
              )}
              <tr className="font-bold">
                <td className="border px-1.5 py-1" colSpan={12} style={{ ...bh, background: "#FFF7CC" }}>
                  GRAND TOTAL REWARD {periodLabel}
                </td>
                <td className="border px-1.5 py-1 text-right tnum" style={{ ...bh, background: "#FFF7CC" }}>
                  {nf.format(recap.grand)}
                </td>
              </tr>
            </tbody>
          </table>

          <p className="text-[11.5px] mt-5">{report.closing}</p>
          <div className="text-[11.5px] mt-4 text-right pr-6">{report.city}, {todayLabel()}</div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-[11.5px]">
            {report.signers.map((s, i) => (
              <div key={i} className="text-center">
                <div>{s.role}</div>
                <div style={{ height: 52 }} />
                <div className="font-semibold underline">{s.name}</div>
                <div>{s.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- pengaturan ---------- */}
      <div className="space-y-4 no-print">
        <div className="rounded-lg border bg-white p-4" style={{ borderColor: LINE }}>
          <div className="font-semibold text-[14px] mb-3">Identitas laporan</div>
          <div className="space-y-3 text-[13px]">
            <div>
              <div className="text-[11px] mb-1" style={{ color: SLATE }}>Periode tercetak</div>
              <div className="px-2.5 py-1.5 rounded border tnum" style={{ borderColor: LINE, background: "#FAFBFC" }}>
                {periodLabel || "—"}
              </div>
              <div className="text-[11px] mt-1" style={{ color: SLATE }}>
                Ikut rentang tanggal yang dipilih di atas.
              </div>
            </div>
            <div>
              <div className="text-[11px] mb-1" style={{ color: SLATE }}>Kota</div>
              <input
                value={report.city}
                onChange={(e) => setReport((p) => ({ ...p, city: e.target.value }))}
                className="w-full rounded border px-2.5 py-1.5"
                style={{ borderColor: LINE }}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={report.bonusOn}
                onChange={(e) => setReport((p) => ({ ...p, bonusOn: e.target.checked }))}
                style={{ accentColor: INK }}
              />
              Sertakan Bonus Top Viewers
            </label>
            {report.bonusOn && (
              <div>
                <div className="text-[11px] mb-1" style={{ color: SLATE }}>
                  Nominal bonus{topViewer ? ` — ${topViewer.name}` : ""}
                </div>
                <input
                  type="number"
                  step="50000"
                  value={report.bonusAmount}
                  onChange={(e) => setReport((p) => ({ ...p, bonusAmount: +e.target.value || 0 }))}
                  className="w-full rounded border px-2.5 py-1.5 tnum text-right"
                  style={{ borderColor: LINE }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4" style={{ borderColor: LINE }}>
          <div className="font-semibold text-[14px] mb-3">Penanda tangan</div>
          <div className="space-y-3">
            {report.signers.map((s, i) => (
              <div key={i} className="space-y-1.5">
                {["role", "name", "title"].map((f) => (
                  <input
                    key={f}
                    value={s[f]}
                    placeholder={f === "role" ? "Menyetujui," : f === "name" ? "Nama" : "Jabatan"}
                    onChange={(e) =>
                      setReport((p) => {
                        const sg = [...p.signers];
                        sg[i] = { ...sg[i], [f]: e.target.value };
                        return { ...p, signers: sg };
                      })
                    }
                    className="w-full rounded border px-2.5 py-1.5 text-[12.5px]"
                    style={{ borderColor: LINE, fontWeight: f === "name" ? 600 : 400 }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t" style={{ borderColor: "#EEF1F5" }}>
            <Btn size="sm" variant="solid" onClick={onSave}><Check size={13} /> Simpan</Btn>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4" style={{ borderColor: LINE }}>
          <div className="font-semibold text-[14px]">Catatan per karyawan</div>
          <div className="text-[11.5px] mt-1 mb-3" style={{ color: SLATE }}>
            Untuk penugasan khusus, cuti, atau dinas luar. Muncul di kolom Catatan pada file Excel.
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {results.map((r) => (
              <div key={r.name}>
                <div className="text-[11px] mb-0.5" style={{ color: SLATE }}>{r.name}</div>
                <input
                  value={notes[r.name] || ""}
                  onChange={(e) => setNotes((p) => ({ ...p, [r.name]: e.target.value }))}
                  placeholder="—"
                  className="w-full rounded border px-2 py-1 text-[12.5px]"
                  style={{ borderColor: LINE }}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-lg border p-4 text-[12px] leading-relaxed"
          style={{ borderColor: LINE, background: "#FFFDF2", color: "#6B5A16" }}
        >
          File Excel yang diunduh berisi empat sheet: laporan utama dengan blok tanda tangan, rekap reward,
          skema penilaian, dan seluruh data artikel. Pewarnaan sel perlu ditambahkan sendiri di Excel bila diperlukan.
        </div>
      </div>
    </div>
  );
}
