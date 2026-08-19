import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { SLATE, LINE, INK, GREEN, AMBER } from "../lib/constants.js";
import { nf, pct, rupiah, dLabel } from "../lib/format.js";
import { Stat, GradePill, ScoreBar } from "./ui.jsx";

export default function Standings({ results, articles, totals, range, onOpen }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => results.filter((r) => r.name.toLowerCase().includes(q.toLowerCase())),
    [results, q]
  );

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Artikel" value={nf.format(articles.length)} sub={`${dLabel(range.from)} – ${dLabel(range.to)}`} />
        <Stat
          label="Total views"
          value={nf.format(totals.views)}
          sub={`rata-rata ${nf.format(Math.round(totals.views / Math.max(articles.length, 1)))} per artikel`}
        />
        <Stat
          label="Rata-rata skor"
          value={pct(totals.avg)}
          sub={`${totals.people} orang dinilai`}
          accent={totals.avg >= 1 ? GREEN : AMBER}
        />
        <Stat label="Berhak reward" value={`${totals.rewarded} orang`} sub={rupiah(totals.reward)} accent={GREEN} />
      </div>

      <div className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: LINE }}>
        <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ borderColor: "#EEF1F5" }}>
          <div className="relative flex-1 max-w-[280px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: SLATE }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama"
              className="w-full rounded border pl-8 pr-2 py-1.5 text-[13px]"
              style={{ borderColor: LINE }}
            />
          </div>
          <div className="flex-1" />
          <div className="hidden sm:flex items-center gap-3 text-[11px]" style={{ color: SLATE }}>
            <span className="flex items-center gap-1.5">
              <span style={{ width: 10, height: 10, background: GREEN, borderRadius: 2 }} /> viewers
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ width: 10, height: 10, background: GREEN, opacity: 0.42, borderRadius: 2 }} /> produktivitas
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ width: 2, height: 11, background: INK }} /> ambang 110%
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left" style={{ background: "#FAFBFC" }}>
                {["", "Nama", "Komposisi skor", "Artikel", "Kredit viewers", "Grade", "Reward"].map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-[10px] font-semibold tracking-[0.1em] uppercase whitespace-nowrap"
                    style={{ color: SLATE, textAlign: i >= 3 && i <= 4 ? "right" : "left" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.name}
                  onClick={() => onOpen(r.name)}
                  className="border-t cursor-pointer hover:bg-black/[0.015]"
                  style={{ borderColor: "#F0F2F6" }}
                >
                  <td className="px-3 py-2.5 tnum text-[12px] font-semibold" style={{ color: SLATE, width: 34 }}>
                    {results.indexOf(r) + 1}
                  </td>
                  <td className="px-3 py-2.5 min-w-[150px]">
                    <div className="font-semibold leading-tight">{r.name}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: SLATE }}>{r.role}</div>
                  </td>
                  <td className="px-3 py-2.5 min-w-[220px] w-[34%]">
                    <ScoreBar vPart={r.vPart} pPart={r.pPart} score={r.score} />
                    <div className="mt-1 flex gap-3 text-[10.5px] tnum" style={{ color: SLATE }}>
                      <span>views {pct(r.pViews)}</span>
                      <span>prod {pct(r.pProd)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right tnum whitespace-nowrap">
                    {nf.format(r.count)}
                    <span className="text-[11px]" style={{ color: SLATE }}> / {nf.format(Math.round(r.tProd))}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right tnum whitespace-nowrap">
                    {nf.format(r.credit)}
                    <span className="text-[11px]" style={{ color: SLATE }}> / {nf.format(Math.round(r.tViews))}</span>
                  </td>
                  <td className="px-3 py-2.5"><GradePill g={r.grade} /></td>
                  <td className="px-3 py-2.5 whitespace-nowrap tnum" style={{ color: r.reward ? GREEN : SLATE }}>
                    {rupiah(r.reward)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="px-4 py-10 text-center text-[13px]" style={{ color: SLATE }}>
            Tidak ada nama yang cocok dengan pencarian.
          </div>
        )}
      </div>
      <p className="mt-2.5 text-[12px]" style={{ color: SLATE }}>
        Angka setelah garis miring adalah target untuk periode yang dipilih. Klik baris untuk melihat daftar artikel.
      </p>
    </>
  );
}
