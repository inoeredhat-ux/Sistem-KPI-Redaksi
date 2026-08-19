import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Upload, FileSpreadsheet, Users, Settings2, AlertTriangle, CheckCircle2,
  Download, Copy, Calendar, Trophy, FileText, Cloud, CloudOff, RefreshCw,
} from "lucide-react";

import {
  INK, RED, PAPER, SLATE, LINE, BULAN,
  DEFAULT_PARAMS, DEFAULT_TARGETS, DEFAULT_REPORT,
} from "./lib/constants.js";
import { nf, pct, dLabel } from "./lib/format.js";
import { readFile } from "./lib/parse.js";
import {
  filterByRange, prorateRatio, collectNames, computeResults,
  summarise, gradeRecap, runChecks, buildPresets,
} from "./lib/kpi.js";
import * as store from "./lib/storage.js";
import { exportKlasemen, exportLaporan, teksWhatsApp } from "./lib/exportXlsx.js";

import { Btn, Toast } from "./components/ui.jsx";
import UploadZone from "./components/UploadZone.jsx";
import Standings from "./components/Standings.jsx";
import ReportTab from "./components/ReportTab.jsx";
import RosterTab from "./components/RosterTab.jsx";
import RulesTab from "./components/RulesTab.jsx";
import ChecksTab from "./components/ChecksTab.jsx";
import DetailDrawer from "./components/DetailDrawer.jsx";

export default function App() {
  const [articles, setArticles] = useState([]);
  const [colMap, setColMap] = useState({});
  const [fileName, setFileName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("klasemen");

  const [roster, setRoster] = useState({});
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [targets, setTargets] = useState(DEFAULT_TARGETS);
  const [report, setReport] = useState(DEFAULT_REPORT);
  const [notes, setNotes] = useState({});

  const [range, setRange] = useState({ from: "", to: "" });
  const [prorate, setProrate] = useState(true);
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState("");
  const fileRef = useRef(null);

  // status penyimpanan: "memuat" | "server" | "lokal"
  const [sync, setSync] = useState({ status: "memuat", pesan: "", updatedAt: null, updatedBy: "" });
  const [adaPerubahan, setAdaPerubahan] = useState(null);
  const [nama, setNamaState] = useState(store.getNama());

  const say = useCallback((m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2400);
  }, []);

  /* ---------- muat pengaturan ---------- */
  const terapkan = useCallback((s) => {
    if (!s) return;
    if (s.roster) setRoster(s.roster);
    if (s.params && Object.keys(s.params).length) setParams(s.params);
    if (s.targets && Object.keys(s.targets).length) setTargets(s.targets);
    if (s.report && Object.keys(s.report).length) setReport({ ...DEFAULT_REPORT, ...s.report });
  }, []);

  useEffect(() => {
    (async () => {
      const { status, data, pesan } = await store.loadRemote();
      if (status === "server" && data) {
        terapkan(data);
        store.saveLocal(data);
        setSync({ status: "server", pesan: "", updatedAt: data.updatedAt, updatedBy: data.updatedBy });
        return;
      }
      if (status === "server") {
        // server siap tapi belum ada isinya
        terapkan(store.loadLocal());
        setSync({ status: "server", pesan: "", updatedAt: null, updatedBy: "" });
        return;
      }
      terapkan(store.loadLocal());
      setSync({ status: "lokal", pesan: pesan || "", updatedAt: null, updatedBy: "" });
    })();
  }, [terapkan]);

  /* ---------- pantau perubahan dari perangkat lain ---------- */
  useEffect(() => {
    if (sync.status !== "server") return;
    const t = setInterval(async () => {
      const baru = await store.cekPerubahan(sync.updatedAt);
      if (baru) setAdaPerubahan(baru);
    }, 30000);
    return () => clearInterval(t);
  }, [sync.status, sync.updatedAt]);

  const muatPerubahan = () => {
    terapkan(adaPerubahan);
    store.saveLocal(adaPerubahan);
    setSync((p) => ({ ...p, updatedAt: adaPerubahan.updatedAt, updatedBy: adaPerubahan.updatedBy }));
    setAdaPerubahan(null);
    say("Pengaturan terbaru dimuat");
  };

  const saveAll = async () => {
    const data = { roster, params, targets, report };
    store.saveLocal(data);
    const r = await store.saveRemote(data);
    if (r.ok) {
      setSync((p) => ({ ...p, status: "server", updatedAt: r.updatedAt, updatedBy: nama || "tanpa nama" }));
      setAdaPerubahan(null);
      say("Tersimpan di server, semua orang melihat pengaturan yang sama");
    } else {
      setSync((p) => ({ ...p, status: "lokal", pesan: r.pesan }));
      say(`${r.pesan}. Untuk sementara tersimpan di peramban ini.`);
    }
  };

  const exportCfg = () => {
    store.simpanKeBerkas({ roster, params, targets, report });
    say("Pengaturan diunduh sebagai JSON");
  };

  const importCfg = async (file) => {
    try {
      const s = await store.muatDariBerkas(file);
      terapkan(s);
      store.saveLocal(s);
      say("Pengaturan dimuat. Tekan Simpan agar berlaku untuk semua orang.");
    } catch {
      say("File pengaturan tidak terbaca");
    }
  };

  const resetCfg = () => {
    store.clearLocal();
    setParams(DEFAULT_PARAMS);
    setTargets(DEFAULT_TARGETS);
    setReport(DEFAULT_REPORT);
    setRoster({});
    say("Dikembalikan ke bawaan. Tekan Simpan bila ingin berlaku untuk semua orang.");
  };

  /* ---------- baca file ---------- */
  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const { articles: arts, map } = await readFile(file);
      if (!arts.length) {
        setErr("Tidak ada baris artikel yang terbaca. Pastikan file punya kolom penulis dan editor.");
        setBusy(false);
        return;
      }
      if (!map.views) setErr("Kolom jumlah views tidak ditemukan. Penilaian viewers akan bernilai nol.");

      const days = arts.map((a) => a.day).filter(Boolean).sort();
      setArticles(arts);
      setColMap(map);
      setFileName(file.name);
      setRange({ from: days[0] || "", to: days[days.length - 1] || "" });

      // isi jabatan untuk nama yang belum diatur
      const seenE = {};
      arts.forEach((a) => { if (a.editor) seenE[a.editor] = (seenE[a.editor] || 0) + 1; });
      setRoster((prev) => {
        const next = { ...prev };
        collectNames(arts).forEach(({ n }) => {
          if (!next[n]) next[n] = (seenE[n] || 0) >= 20 ? "Redaktur" : "Reporter";
        });
        return next;
      });
      setTab("klasemen");
    } catch {
      setErr("File tidak terbaca. Gunakan format .xlsx, .xls, atau .csv hasil export CMS.");
    }
    setBusy(false);
  };

  /* ---------- turunan ---------- */
  const presets = useMemo(() => buildPresets(articles), [articles]);
  const inRange = useMemo(() => filterByRange(articles, range), [articles, range]);
  const ratio = useMemo(() => prorateRatio(range, prorate), [range, prorate]);
  const results = useMemo(
    () => computeResults({ articles: inRange, roster, targets, params, ratio }),
    [inRange, roster, targets, params, ratio]
  );
  const totals = useMemo(() => summarise(results, inRange), [results, inRange]);
  const names = useMemo(() => collectNames(articles), [articles]);
  const checks = useMemo(
    () => runChecks({ articles: inRange, colMap, results, roster, params }),
    [inRange, colMap, results, roster, params]
  );
  const failing = checks.filter((c) => !c.ok).length;

  const topViewer = useMemo(
    () => results.reduce((best, r) => (!best || r.credit > best.credit ? r : best), null),
    [results]
  );
  const recap = useMemo(() => gradeRecap(results, report, topViewer), [results, report, topViewer]);

  const periodLabel = useMemo(() => {
    if (!range.to) return "";
    const y = range.to.slice(0, 4);
    const m = +range.to.slice(5, 7);
    const sameMonth = range.from.slice(0, 7) === range.to.slice(0, 7);
    if (sameMonth && ratio >= 0.999) return `${BULAN[m - 1].toUpperCase()} ${y}`;
    return `${dLabel(range.from)} – ${dLabel(range.to)}`.toUpperCase();
  }, [range, ratio]);

  const ctx = { results, articles: inRange, range, fileName, params, targets, prorate, ratio, totals, recap };

  const copyWA = async () => {
    try {
      await navigator.clipboard.writeText(teksWhatsApp(ctx));
      say("Ringkasan WhatsApp tersalin");
    } catch {
      say("Penyalinan gagal, gunakan unduh Excel");
    }
  };

  const TABS = [
    ["klasemen", "Klasemen", Trophy],
    ["laporan", "Laporan", FileText],
    ["orang", "Jabatan", Users],
    ["aturan", "Aturan", Settings2],
    ["cek", "Cek data", failing ? AlertTriangle : CheckCircle2],
  ];

  return (
    <div className="min-h-screen w-full font-sans" style={{ background: PAPER, color: INK }}>
      <header style={{ background: INK }}>
        <div className="max-w-[1180px] mx-auto px-5 py-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2.5">
            <div style={{ width: 4, height: 26, background: RED }} />
            <div>
              <div className="text-white text-[17px] font-extrabold leading-none tracking-tight font-display">
                Papan KPI Redaksi
              </div>
              <div className="text-[10.5px] mt-1 tracking-[0.16em] uppercase" style={{ color: "#8593AC" }}>
                Inilah.com
              </div>
            </div>
          </div>
          <div className="flex-1" />
          <SyncBadge sync={sync} nama={nama} setNama={(v) => { setNamaState(v); store.setNama(v); }} />
          {articles.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {TABS.map(([k, l, Icon]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTab(k)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors"
                  style={{ background: tab === k ? "#FFFFFF" : "transparent", color: tab === k ? INK : "#A9B5C9" }}
                >
                  <Icon size={13} strokeWidth={2.2} style={{ color: k === "cek" && failing ? RED : undefined }} />
                  {l}
                  {k === "cek" && failing > 0 && (
                    <span className="ml-0.5 px-1 rounded text-[10px] font-bold" style={{ background: RED, color: "#fff" }}>
                      {failing}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-5 py-6">
        {adaPerubahan && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg px-4 py-3 text-[13px] no-print"
            style={{ background: "#EAF3FB", color: "#1B4C73" }}>
            <RefreshCw size={15} className="shrink-0" />
            <span>
              Pengaturan diubah dari perangkat lain
              {adaPerubahan.updatedBy ? ` oleh ${adaPerubahan.updatedBy}` : ""}.
            </span>
            <div className="flex-1" />
            <Btn size="sm" onClick={muatPerubahan}>Muat yang terbaru</Btn>
            <Btn size="sm" variant="quiet" onClick={() => setAdaPerubahan(null)}>Nanti saja</Btn>
          </div>
        )}

        {!articles.length && <UploadZone onFile={handleFile} busy={busy} fileRef={fileRef} />}

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {err && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg px-4 py-3 text-[13px] no-print"
            style={{ background: "#FDECEC", color: "#8C1A20" }}>
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {articles.length > 0 && (
          <>
            <div className="rounded-lg border bg-white p-4 mb-5 no-print" style={{ borderColor: LINE }}>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 text-[13px] font-medium">
                  <FileSpreadsheet size={15} style={{ color: SLATE }} />
                  <span className="truncate max-w-[220px]" title={fileName}>{fileName}</span>
                  <span style={{ color: SLATE }}>· {nf.format(articles.length)} artikel</span>
                </div>
                <div className="flex-1" />
                <Btn size="sm" onClick={() => fileRef.current?.click()}><Upload size={13} /> Ganti file</Btn>
                <Btn size="sm" onClick={copyWA}><Copy size={13} /> Salin ringkasan</Btn>
                <Btn size="sm" variant="solid" onClick={() => exportKlasemen(ctx)}>
                  <Download size={13} /> Unduh klasemen
                </Btn>
              </div>

              <div className="mt-4 pt-4 border-t flex flex-wrap items-end gap-x-5 gap-y-3" style={{ borderColor: "#EEF1F5" }}>
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.13em] uppercase mb-1.5" style={{ color: SLATE }}>
                    Periode
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="date" value={range.from}
                      onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                      className="rounded border px-2 py-1.5 text-[13px]" style={{ borderColor: LINE }} />
                    <span style={{ color: SLATE }}>–</span>
                    <input type="date" value={range.to}
                      onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                      className="rounded border px-2 py-1.5 text-[13px]" style={{ borderColor: LINE }} />
                  </div>
                </div>

                {presets.months.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.13em] uppercase mb-1.5" style={{ color: SLATE }}>
                      Bulanan
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {presets.months.map((m) => (
                        <Btn key={m.key} size="sm" onClick={() => setRange({ from: m.from, to: m.to })}>
                          <Calendar size={12} /> {m.key}
                        </Btn>
                      ))}
                    </div>
                  </div>
                )}

                {presets.weeks.length > 1 && (
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.13em] uppercase mb-1.5" style={{ color: SLATE }}>
                      Mingguan
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {presets.weeks.map((w) => (
                        <Btn key={w.key} size="sm" onClick={() => setRange({ from: w.from, to: w.to })}
                          title={`${w.from} – ${w.to}`}>
                          {w.key}
                        </Btn>
                      ))}
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 text-[13px] cursor-pointer select-none">
                  <input type="checkbox" checked={prorate} onChange={(e) => setProrate(e.target.checked)}
                    style={{ accentColor: INK }} />
                  Prorata target
                  {prorate && (
                    <span className="tnum px-1.5 py-0.5 rounded text-[11px] font-semibold"
                      style={{ background: "#EDF0F4", color: SLATE }}>
                      {pct(ratio)}
                    </span>
                  )}
                </label>
              </div>
            </div>

            {tab === "klasemen" && (
              <Standings results={results} articles={inRange} totals={totals} range={range} onOpen={setDetail} />
            )}

            {tab === "laporan" && (
              <ReportTab
                results={results} totals={totals} report={report} setReport={setReport}
                notes={notes} setNotes={setNotes} periodLabel={periodLabel} topViewer={topViewer}
                recap={recap} params={params} onSave={saveAll}
                onExport={() => {
                  exportLaporan({ ...ctx, report, notes, periodLabel, topViewer });
                  say("Laporan bulanan terunduh");
                }}
              />
            )}

            {tab === "orang" && (
              <RosterTab
                names={names} roster={roster} setRoster={setRoster} onSave={saveAll}
                onExportCfg={exportCfg} onImportCfg={importCfg} onReset={resetCfg}
              />
            )}

            {tab === "aturan" && (
              <RulesTab params={params} setParams={setParams} targets={targets} setTargets={setTargets} onSave={saveAll} />
            )}

            {tab === "cek" && <ChecksTab checks={checks} />}
          </>
        )}
      </main>

      <DetailDrawer
        name={detail}
        row={results.find((r) => r.name === detail)}
        articles={inRange}
        params={params}
        roster={roster}
        onClose={() => setDetail(null)}
      />

      <Toast text={toast} />
    </div>
  );
}

/* ---------------------------------------------------------------- */

/** Penanda tempat pengaturan tersimpan, plus kolom nama pengubah. */
function SyncBadge({ sync, nama, setNama }) {
  const server = sync.status === "server";
  const memuat = sync.status === "memuat";
  const warna = memuat ? "#8593AC" : server ? "#7FD8B0" : "#F0B37E";
  const Icon = server ? Cloud : CloudOff;

  return (
    <div className="flex items-center gap-2 no-print">
      {server && (
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama Anda"
          title="Dicatat sebagai pengubah pengaturan"
          className="rounded px-2 py-1 text-[11.5px] w-[110px] bg-transparent border"
          style={{ borderColor: "#3A4560", color: "#D6DEEA" }}
        />
      )}
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium"
        style={{ background: "#1E2740", color: warna }}
        title={
          memuat
            ? "Memeriksa penyimpanan"
            : server
            ? "Pengaturan tersimpan di server. Semua orang melihat data yang sama."
            : `${sync.pesan}. Pengaturan hanya berlaku di peramban ini.`
        }
      >
        <Icon size={12} strokeWidth={2.2} />
        {memuat ? "Memeriksa…" : server ? "Server" : "Peramban ini"}
      </div>
    </div>
  );
}
