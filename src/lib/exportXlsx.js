import * as XLSX from "xlsx";
import { TIERS, VIDEO_JENIS, VIDEO_PLATFORM } from "./constants.js";
import { nf, pct, rupiah, dLabel, todayLabel } from "./format.js";

const MONEY = '#,##0;[Red]-#,##0;"-"';

/** Klasemen ringkas — untuk berbagi cepat, bukan laporan resmi. */
export function exportKlasemen({ results, articles, range, fileName, params, prorate, ratio, totals }) {
  const head = [
    "Peringkat", "Nama", "Jabatan", "Artikel Ditulis", "Artikel Disunting", "Dihitung",
    "Target Produktivitas", "% Produktivitas", "Views Tulisan", "Views Suntingan",
    "Kredit Viewers", "Target Viewers", "% Viewers", "Skor KPI", "Grade", "Keterangan", "Reward",
  ];
  const body = results.map((r, i) => [
    i + 1, r.name, r.role, r.nw, r.ne, r.count, Math.round(r.tProd),
    +(r.pProd * 100).toFixed(1), r.vw, r.ve, r.credit, Math.round(r.tViews),
    +(r.pViews * 100).toFixed(1), +(r.score * 100).toFixed(1), r.grade, r.label.toUpperCase(), r.reward,
  ]);
  const meta = [
    ["Papan KPI Redaksi — Inilah.com"],
    [`Periode ${dLabel(range.from)} sampai ${dLabel(range.to)}`],
    [`Sumber: ${fileName} · ${nf.format(articles.length)} artikel · ${nf.format(totals.views)} views`],
    [prorate ? `Target diprorata ${pct(ratio)} dari target bulanan` : "Target memakai angka bulanan penuh"],
    [`Bobot ${pct(params.wViews)} viewers / ${pct(params.wProd)} produktivitas · Kredit ${pct(params.cWriter)} penulis / ${pct(params.cEditor)} editor`],
    [],
  ];

  const ws = XLSX.utils.aoa_to_sheet([...meta, head, ...body]);
  ws["!cols"] = head.map((h, i) => ({
    wch: i === 1 ? 26 : i === 2 ? 20 : Math.max(h.length + 2, 11),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Klasemen");
  XLSX.utils.book_append_sheet(wb, sheetArtikel(articles), "Data Artikel");
  XLSX.writeFile(wb, `KPI_${range.from}_sd_${range.to}.xlsx`);
}

function sheetArtikel(articles) {
  const ws = XLSX.utils.json_to_sheet(
    articles.map((a) => ({
      Tanggal: a.day, Judul: a.title, Penulis: a.author, Editor: a.editor, Views: a.views,
    }))
  );
  ws["!cols"] = [{ wch: 12 }, { wch: 70 }, { wch: 24 }, { wch: 24 }, { wch: 10 }];
  return ws;
}

/**
 * Laporan bulanan resmi: empat sheet, lengkap dengan blok tanda tangan.
 *
 * Catatan: pustaka xlsx versi komunitas tidak menulis warna dan tebal sel.
 * Struktur, penggabungan sel, lebar kolom, dan format angka tetap tersimpan.
 */
export function exportLaporan({
  results, articles, range, fileName, params, targets, prorate, ratio,
  totals, report, notes, periodLabel, topViewer, recap,
  manual: manualData = {}, poin: poinData = {}, faktor: faktorData = {},
}) {
  const NC = 16;
  const wb = XLSX.utils.book_new();
  const A = [];
  const push = (arr) => A.push([...arr, ...Array(Math.max(0, NC - arr.length)).fill("")]);

  push(["LAPORAN PENCAPAIAN BERITA & KPI REDAKSI"]);
  push([`PERIODE : ${periodLabel}  |  Skema ${pct(params.wViews)} Viewers + ${pct(params.wProd)} Produktivitas`]);
  push([report.intro]);
  push([]);
  push([
    "No", "Karyawan", "Jabatan", "Disunting", "Ditulis", "Dihitung",
    "Target Produktivitas", "% Produktivitas", "Kredit Viewers", "Target Viewers",
    "% Viewers", `Skor KPI (${Math.round(params.wViews * 100)}/${Math.round(params.wProd * 100)})`,
    "Grade", "Keterangan", "Reward (Rp)", "Catatan",
  ]);

  const HEAD = A.length;
  const sorted = [...results].sort((a, b) => a.name.localeCompare(b.name, "id"));
  sorted.forEach((r, i) => {
    push([
      i + 1, r.name, r.role, r.ne || "", r.nw || "", r.count,
      Math.round(r.tProd), r.pProd, r.credit, Math.round(r.tViews), r.pViews,
      r.score, r.grade, r.label.toUpperCase(), r.reward, notes[r.name] || "",
    ]);
  });
  const FIRST = HEAD + 1;

  const sum = (k) => sorted.reduce((s, r) => s + (r[k] || 0), 0);
  const tProdSum = sorted.reduce((s, r) => s + r.tProd, 0);
  const tViewSum = sorted.reduce((s, r) => s + r.tViews, 0);
  const cntSum = sum("count");
  const crSum = sum("credit");
  const pProdT = cntSum / (tProdSum || 1);
  const pViewT = crSum / (tViewSum || 1);

  push([
    "Total Keseluruhan", "", "", sum("ne"), sum("nw"), cntSum, Math.round(tProdSum),
    pProdT, crSum, Math.round(tViewSum), pViewT,
    params.wViews * pViewT + params.wProd * pProdT, "", "SKOR REDAKSI", recap.tierTotal, "",
  ]);
  const TOTROW = A.length;

  let BONUSROW = null;
  if (report.bonusOn && topViewer) {
    push([
      `Bonus Top Viewers (${topViewer.name} — ${nf.format(topViewer.credit)} kredit viewers)`,
      "", "", "", "", "", "", "", "", "", "", "", "", "", report.bonusAmount, "",
    ]);
    BONUSROW = A.length;
  }
  push([`GRAND TOTAL REWARD ${periodLabel}`, "", "", "", "", "", "", "", "", "", "", "", "", "", recap.grand, ""]);
  const GRANDROW = A.length;

  push([]);
  push(["", report.closing]);
  const CLOSEROW = A.length;
  push(["", "", "", "", "", "", "", "", `${report.city}, ${todayLabel()}`]);
  const DATEROW = A.length;
  push([]);
  push(["", report.signers[0].role, "", "", report.signers[1].role, "", "", "", report.signers[2].role]);
  const ROLEROW = A.length;
  push([]);
  push([]);
  push(["", report.signers[0].name, "", "", report.signers[1].name, "", "", "", report.signers[2].name]);
  const NAMEROW = A.length;
  push(["", report.signers[0].title, "", "", report.signers[1].title, "", "", "", report.signers[2].title]);
  const TITLEROW = A.length;

  const ws = XLSX.utils.aoa_to_sheet(A);
  ws["!cols"] = [
    { wch: 5 }, { wch: 24 }, { wch: 19 }, { wch: 10 }, { wch: 9 }, { wch: 10 },
    { wch: 13 }, { wch: 13 }, { wch: 14 }, { wch: 13 }, { wch: 11 }, { wch: 13 },
    { wch: 7 }, { wch: 18 }, { wch: 14 }, { wch: 30 },
  ];

  const at = (r, c) => XLSX.utils.encode_cell({ r: r - 1, c });
  for (let r = FIRST; r <= TOTROW; r++) {
    [7, 10, 11].forEach((c) => { const k = at(r, c); if (ws[k]) ws[k].z = "0.0%"; });
    [3, 4, 5, 6, 8, 9, 14].forEach((c) => { const k = at(r, c); if (ws[k]) ws[k].z = "#,##0"; });
  }
  [BONUSROW, GRANDROW].forEach((r) => {
    if (!r) return;
    const k = at(r, 14);
    if (ws[k]) ws[k].z = MONEY;
  });

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: NC - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: NC - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: NC - 1 } },
    { s: { r: TOTROW - 1, c: 0 }, e: { r: TOTROW - 1, c: 2 } },
    { s: { r: GRANDROW - 1, c: 0 }, e: { r: GRANDROW - 1, c: 13 } },
    { s: { r: CLOSEROW - 1, c: 1 }, e: { r: CLOSEROW - 1, c: 13 } },
    { s: { r: DATEROW - 1, c: 8 }, e: { r: DATEROW - 1, c: 11 } },
    ...[ROLEROW, NAMEROW, TITLEROW].flatMap((r) => [
      { s: { r: r - 1, c: 1 }, e: { r: r - 1, c: 2 } },
      { s: { r: r - 1, c: 4 }, e: { r: r - 1, c: 5 } },
      { s: { r: r - 1, c: 8 }, e: { r: r - 1, c: 9 } },
    ]),
  ];
  if (BONUSROW) ws["!merges"].push({ s: { r: BONUSROW - 1, c: 0 }, e: { r: BONUSROW - 1, c: 13 } });
  ws["!freeze"] = { xSplit: 3, ySplit: HEAD };
  XLSX.utils.book_append_sheet(wb, ws, `KPI ${periodLabel}`.slice(0, 31));

  /* ---- rekap reward ---- */
  const R = [];
  R.push(["REKAP REWARD & DISTRIBUSI GRADE"]);
  R.push([`Periode ${periodLabel}`]);
  R.push([]);
  R.push(["Grade", "Keterangan", "Reward per orang (Rp)", "Jumlah Orang", "Total (Rp)"]);
  recap.rows.forEach((g) => R.push([g.grade, g.label.toUpperCase(), g.reward, g.n, g.total]));
  if (recap.bonus) R.push(["", "Bonus Top Viewers", report.bonusAmount, 1, recap.bonus]);
  R.push(["", "TOTAL", "", results.length, recap.grand]);
  R.push([]);
  R.push(["RINGKASAN PRODUKSI"]);
  R.push(["Jumlah artikel pada periode", articles.length]);
  R.push(["Total views seluruh artikel", totals.views]);
  R.push(["Rata-rata views per artikel", Math.round(totals.views / Math.max(articles.length, 1))]);
  R.push(["Jumlah karyawan dinilai", results.length]);
  R.push(["Rata-rata skor KPI", totals.avg]);
  R.push([]);
  R.push(["CATATAN PERHITUNGAN"]);
  R.push([`Rentang data: ${dLabel(range.from)} sampai ${dLabel(range.to)}`]);
  R.push([prorate
    ? `Target diprorata ${pct(ratio)} dari target bulanan, menyesuaikan jumlah hari data.`
    : "Target memakai angka bulanan penuh tanpa prorata."]);
  R.push([`Kredit viewers dibagi ${pct(params.cWriter)} untuk penulis dan ${pct(params.cEditor)} untuk editor.`]);
  R.push([`Sumber data: ${fileName}`]);

  const ws2 = XLSX.utils.aoa_to_sheet(R);
  ws2["!cols"] = [{ wch: 34 }, { wch: 30 }, { wch: 20 }, { wch: 14 }, { wch: 16 }];
  for (let i = 5; i <= 5 + recap.rows.length + 1; i++) {
    [2, 4].forEach((c) => { const k = at(i, c); if (ws2[k]) ws2[k].z = MONEY; });
  }
  XLSX.utils.book_append_sheet(wb, ws2, "Rekap Reward");

  /* ---- skema ---- */
  const S = [];
  S.push(["SKEMA KPI & REWARD REDAKSI INILAH.COM"]);
  S.push([`Model: ${pct(params.wViews)} Viewers + ${pct(params.wProd)} Produktivitas`]);
  S.push([]);
  S.push(["1. BOBOT PENILAIAN"]);
  S.push(["Bobot Viewers", params.wViews]);
  S.push(["Bobot Produktivitas", params.wProd]);
  S.push(["Batas atas (cap) tiap komponen", params.cap]);
  S.push(["Kredit viewers untuk penulis", params.cWriter]);
  S.push(["Kredit viewers untuk editor", params.cEditor]);
  S.push([]);
  S.push(["2. TARGET PER JABATAN (sebulan penuh)"]);
  S.push(["Jabatan", "Target Produktivitas", "Target Viewers"]);
  Object.keys(targets).forEach((k) => S.push([k, targets[k].prod, targets[k].views]));
  S.push([]);
  S.push(["3. TABEL TIER REWARD"]);
  S.push(["Batas Bawah Skor KPI", "Grade", "Keterangan", "Reward (Rp)"]);
  [...TIERS].reverse().forEach((t) => S.push([t.min, t.grade, t.label.toUpperCase(), t.reward]));
  S.push([]);
  S.push(["4. ATURAN"]);
  [
    `a. Skor KPI = (${pct(params.wViews)} x %Viewers) + (${pct(params.wProd)} x %Produktivitas). Kedua komponen di-cap ${pct(params.cap)}.`,
    "b. Reward hanya cair bila skor KPI >= 110%. Skor 100-109% berstatus TERCAPAI tanpa insentif tunai.",
    `c. Bonus Top Viewers ${rupiah(report.bonusAmount)} untuk peraih kredit viewers tertinggi periode berjalan, di luar tier.`,
    `d. Kredit viewers tiap artikel dibagi ${pct(params.cWriter)} untuk penulis dan ${pct(params.cEditor)} untuk editor yang menyunting.`,
    "e. Penugasan khusus (liputan lapangan, investigasi, cuti/dinas) dicatat di kolom Catatan dan",
    "    dapat menjadi dasar penyesuaian target oleh Pemimpin Redaksi.",
    "f. Artikel clickbait menyesatkan atau tanpa verifikasi narasumber dikeluarkan dari perhitungan viewers.",
  ].forEach((t) => S.push([t]));

  const ws3 = XLSX.utils.aoa_to_sheet(S);
  ws3["!cols"] = [{ wch: 42 }, { wch: 22 }, { wch: 22 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Skema KPI");

  /* ---- lampiran: tambahan manual ---- */
  const adaManual = results.some((r) => r.adaManual);
  if (adaManual) {
    const M = [];
    M.push(["TAMBAHAN MANUAL DI LUAR DATA CMS"]);
    M.push([`Periode ${periodLabel}`]);
    M.push(["Artikel indepth multi-penulis dan produksi video media sosial."]);
    M.push([]);
    M.push([
      "Nama", "Jabatan", "Artikel dari CMS", "Artikel Indepth", "Poin Indepth",
      ...VIDEO_JENIS.map((v) => v.label), "Poin Video", "Total Dihitung",
      ...VIDEO_PLATFORM.map((p) => `Views ${p.label}`), "Kredit Video",
      "Kredit Artikel", "Total Kredit",
    ]);
    results.filter((r) => r.adaManual).forEach((r) => {
      const m = manualData[r.name] || {};
      M.push([
        r.name, r.role, r.dasar, m.ind || 0, r.poinIndepth,
        ...VIDEO_JENIS.map((v) => m[v.k] || 0), r.poinVideo, r.count,
        ...VIDEO_PLATFORM.map((p) => m[p.k] || 0), r.kreditVideo,
        r.kreditArtikel, r.credit,
      ]);
    });
    M.push([]);
    M.push(["BOBOT YANG DIPAKAI"]);
    M.push(["Artikel indepth", `${poinData.indepth} poin per artikel`]);
    VIDEO_JENIS.forEach((v) => M.push([v.label, `${poinData[v.k]} poin per video`]));
    M.push([]);
    VIDEO_PLATFORM.forEach((p) => M.push([`Faktor ${p.label}`, faktorData[p.k]]));
    const wsM = XLSX.utils.aoa_to_sheet(M);
    wsM["!cols"] = [{ wch: 26 }, { wch: 19 }, ...Array(20).fill({ wch: 13 })];
    XLSX.utils.book_append_sheet(wb, wsM, "Tambahan Manual");
  }

  XLSX.utils.book_append_sheet(wb, sheetArtikel(articles), "Data Artikel");
  XLSX.writeFile(wb, `Laporan_KPI_${periodLabel.replace(/[^\w]+/g, "_")}.xlsx`);
}

/** Ringkasan siap tempel ke grup WhatsApp. */
export function teksWhatsApp({ results, articles, totals, range, prorate, ratio, recap }) {
  const L = [];
  L.push("*PAPAN KPI REDAKSI INILAH.COM*");
  L.push(`Periode ${dLabel(range.from)} – ${dLabel(range.to)}`);
  L.push(prorate ? `_Target diprorata ${pct(ratio)} dari target bulanan_` : "_Target bulanan penuh_");
  L.push("");
  L.push(`Artikel ${nf.format(articles.length)} · Views ${nf.format(totals.views)} · Rata-rata skor ${pct(totals.avg)}`);
  L.push("");
  results.slice(0, 10).forEach((r, i) => L.push(`${i + 1}. *${r.name}* — ${pct(r.score)} (${r.grade})`));
  if (results.length > 10) L.push(`_...dan ${results.length - 10} nama lainnya_`);
  L.push("");
  L.push(`Berhak reward: ${totals.rewarded} orang · ${rupiah(recap.grand)}`);
  L.push("_Angka sementara. Keberatan menunjuk judul artikel, paling lambat 3 hari._");
  return L.join("\n");
}
