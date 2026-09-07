import React from "react";
import { INK, RED, GREEN, AMBER, SLATE, LINE } from "../lib/constants.js";
import { pct, gradeOf } from "../lib/format.js";

export function Btn({ children, onClick, variant = "ghost", size = "md", disabled, title }) {
  const base =
    "inline-flex items-center gap-2 rounded-md font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";
  const sizes = { sm: "text-xs px-2.5 py-1.5", md: "text-sm px-3.5 py-2" };
  const cls = {
    solid: "text-white hover:opacity-90",
    ghost: "border hover:bg-white",
    quiet: "hover:bg-black/5",
  };
  const style =
    variant === "solid"
      ? { background: INK, ringColor: INK }
      : variant === "ghost"
      ? { borderColor: LINE, color: INK, background: "#fff" }
      : { color: SLATE };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${sizes[size]} ${cls[variant]}`}
      style={style}
    >
      {children}
    </button>
  );
}

export function Stat({ label, value, sub, accent }) {
  return (
    <div className="px-4 py-3.5 rounded-lg border bg-white" style={{ borderColor: LINE }}>
      <div className="text-[10px] font-semibold tracking-[0.13em] uppercase" style={{ color: SLATE }}>
        {label}
      </div>
      <div
        className="mt-1.5 text-2xl font-bold tabular-nums leading-none font-display"
        style={{ color: accent || INK }}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-1.5 text-xs" style={{ color: SLATE }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function GradePill({ g }) {
  const c = g === "D" ? RED : g === "C" ? AMBER : GREEN;
  return (
    <span
      className="inline-flex items-center justify-center min-w-[30px] px-1.5 py-0.5 rounded text-[11px] font-bold font-mono"
      style={{ background: c + "18", color: c }}
    >
      {g}
    </span>
  );
}

/**
 * Batang komposisi skor.
 * Segmen pekat = sumbangan viewers, segmen pudar = sumbangan produktivitas.
 * Garis vertikal menandai ambang 100% dan 110%.
 */
export function ScoreBar({ vPart, mPart = 0, pPart, score }) {
  const SCALE = 2.0;
  const w = (x) => Math.min(x / SCALE, 1) * 100;
  const g = gradeOf(score);
  const col = g.grade === "D" ? RED : g.grade === "C" ? AMBER : GREEN;
  return (
    <div className="relative h-[26px] w-full rounded-[3px] overflow-hidden" style={{ background: "#EDF0F4" }}>
      {/* pekat = viewers web · sedang = engagement medsos · pudar = produktivitas */}
      <div className="absolute inset-y-0 left-0" style={{ width: `${w(vPart)}%`, background: col }} />
      <div
        className="absolute inset-y-0"
        style={{ left: `${w(vPart)}%`, width: `${w(mPart)}%`, background: col, opacity: 0.68 }}
      />
      <div
        className="absolute inset-y-0"
        style={{ left: `${w(vPart + mPart)}%`, width: `${w(pPart)}%`, background: col, opacity: 0.34 }}
      />
      {[1, 1.1].map((m) => (
        <div
          key={m}
          className="absolute inset-y-0"
          style={{
            left: `${w(m)}%`,
            width: 1,
            background: m === 1 ? "#98A3B5" : INK,
            opacity: m === 1 ? 0.6 : 0.85,
          }}
        />
      ))}
      <div
        className="absolute inset-y-0 right-2 flex items-center text-[11px] font-bold tabular-nums font-mono"
        style={{ color: INK }}
      >
        {pct(score)}
      </div>
    </div>
  );
}

export function Toast({ text }) {
  if (!text) return null;
  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-md text-[13px] font-medium text-white shadow-lg no-print"
      style={{ background: INK }}
    >
      {text}
    </div>
  );
}
