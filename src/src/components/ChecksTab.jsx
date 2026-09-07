import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { SLATE, LINE, GREEN, RED } from "../lib/constants.js";

export default function ChecksTab({ checks }) {
  const failing = checks.filter((c) => !c.ok).length;
  return (
    <div className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: LINE }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: "#EEF1F5" }}>
        <div className="font-semibold text-[14px]">
          {failing === 0 ? "Semua pemeriksaan lolos" : `${failing} hal perlu diperiksa`}
        </div>
        <div className="text-[12.5px] mt-0.5" style={{ color: SLATE }}>
          Selesaikan sebelum angka dibagikan ke tim.
        </div>
      </div>
      <div>
        {checks.map((c, i) => (
          <div key={i} className="px-5 py-3 flex items-start gap-3 border-b last:border-0" style={{ borderColor: "#F0F2F6" }}>
            {c.ok
              ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: GREEN }} />
              : <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: RED }} />}
            <div>
              <div className="text-[13px] font-medium">{c.t}</div>
              <div className="text-[12px] mt-0.5" style={{ color: c.ok ? SLATE : RED }}>{c.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
