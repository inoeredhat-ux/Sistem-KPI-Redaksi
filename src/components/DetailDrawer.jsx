import React from "react";
import { X } from "lucide-react";
import { SLATE, LINE } from "../lib/constants.js";
import { nf, pct, rupiah, dLabel } from "../lib/format.js";

export default function DetailDrawer({ name, row, articles, params, roster, onClose }) {
  if (!name) return null;
  const list = articles
    .filter((a) => a.author === name || a.editor === name)
    .sort((a, b) => b.views - a.views);

  return (
    <div className="fixed inset-0 z-50 flex justify-end no-print" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(18,24,42,0.4)" }} />
      <div
        className="relative w-full max-w-[560px] h-full overflow-y-auto shadow-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 px-5 py-4 border-b flex items-start gap-3 bg-white" style={{ borderColor: LINE }}>
          <div>
            <div className="text-[17px] font-bold font-display">{name}</div>
            <div className="text-[12px] mt-0.5" style={{ color: SLATE }}>
              {roster[name]} · {nf.format(list.length)} artikel pada periode ini
            </div>
          </div>
          <div className="flex-1" />
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-black/5">
            <X size={17} style={{ color: SLATE }} />
          </button>
        </div>

        {row && (
          <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b" style={{ borderColor: "#EEF1F5" }}>
            {[
              ["Skor KPI", pct(row.score)],
              ["Grade", row.grade + " · " + row.label],
              ["Views tulisan", nf.format(row.vw)],
              ["Views suntingan", nf.format(row.ve)],
              ["Kredit viewers", nf.format(row.credit)],
              ["Reward", rupiah(row.reward)],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="text-[10px] font-semibold tracking-[0.12em] uppercase" style={{ color: SLATE }}>{l}</div>
                <div className="text-[15px] font-semibold tnum mt-0.5">{v}</div>
              </div>
            ))}
            <div className="col-span-2 text-[12px] leading-relaxed pt-1" style={{ color: SLATE }}>
              Kredit = {pct(params.cWriter)} × {nf.format(row.vw)} + {pct(params.cEditor)} × {nf.format(row.ve)} = {nf.format(row.credit)}
            </div>
          </div>
        )}

        <div className="px-5 py-3">
          <div className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: SLATE }}>
            Artikel, diurutkan dari views tertinggi
          </div>
          {list.map((a) => (
            <div key={a.id} className="py-2.5 border-b flex gap-3" style={{ borderColor: "#F2F4F7" }}>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] leading-snug">{a.title}</div>
                <div className="text-[11px] mt-1 flex items-center gap-2" style={{ color: SLATE }}>
                  <span>{dLabel(a.day)}</span>
                  <span>·</span>
                  <span>
                    {a.author === name && a.editor === name
                      ? "menulis & menyunting"
                      : a.author === name ? "menulis" : "menyunting"}
                  </span>
                </div>
              </div>
              <div className="text-[13px] font-semibold tnum whitespace-nowrap">{nf.format(a.views)}</div>
            </div>
          ))}
          {!list.length && (
            <div className="py-8 text-center text-[13px]" style={{ color: SLATE }}>
              Tidak ada artikel pada periode ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
