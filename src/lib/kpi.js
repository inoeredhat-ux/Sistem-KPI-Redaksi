import {
  EDITOR_ROLES, DEFAULT_TARGETS, TIERS,
  DEFAULT_VIDEO_POIN, DEFAULT_VIDEO_FAKTOR, MANUAL_KOSONG,
} from "./constants.js";
import { gradeOf } from "./format.js";

/** Saring artikel berdasarkan rentang tanggal (inklusif). */
export function filterByRange(articles, range) {
  return articles.filter(
    (a) =>
      (!range.from || a.day >= range.from) && (!range.to || a.day <= range.to)
  );
}

/**
 * Rasio prorata target: jumlah hari terpilih dibagi jumlah hari dalam bulan.
 * Mengembalikan 1 bila prorata dimatikan atau rentang belum lengkap.
 */
export function prorateRatio(range, enabled) {
  if (!enabled || !range.from || !range.to) return 1;
  const MS = 86400000;
  const days = Math.round((new Date(range.to) - new Date(range.from)) / MS) + 1;
  const y = +range.to.slice(0, 4);
  const m = +range.to.slice(5, 7);
  const inMonth = new Date(y, m, 0).getDate();
  return Math.min(days / inMonth, 1);
}

/** Kumpulkan seluruh nama yang muncul di data, beserta jumlah perannya. */
export function collectNames(articles) {
  const w = {};
  const e = {};
  articles.forEach((a) => {
    if (a.author) w[a.author] = (w[a.author] || 0) + 1;
    if (a.editor) e[a.editor] = (e[a.editor] || 0) + 1;
  });
  return Object.keys({ ...w, ...e }).map((n) => ({
    n,
    w: w[n] || 0,
    e: e[n] || 0,
  }));
}

/**
 * Hitung skor KPI seluruh orang.
 *
 *   kredit  = (cWriter x views artikel yang ditulis)
 *           + (cEditor x views artikel yang disunting)
 *   %views  = min(kredit / target views, cap)
 *   %prod   = min(jumlah artikel / target produktivitas, cap)
 *   skor    = (wViews x %views) + (wProd x %prod)
 */
export function computeResults({
  articles, roster, targets, params, ratio,
  manual = {}, poin = DEFAULT_VIDEO_POIN, faktor = DEFAULT_VIDEO_FAKTOR,
}) {
  const acc = {};
  const touch = (n) =>
    (acc[n] = acc[n] || {
      name: n, nw: 0, ne: 0, vw: 0, ve: 0,
      veAlih: 0,      // views artikel yang penulisnya tidak dinilai
      nAdv: 0,        // jumlah artikel semacam itu yang disunting
    });

  const alihkan = params.alihkanKreditPenulis !== false;

  articles.forEach((a) => {
    // penulis yang tidak dinilai (mis. byline Advertorial) tidak punya baris sendiri
    const penulisDilewati = !a.author || roster[a.author] === "Tidak dinilai";

    if (a.author) {
      const t = touch(a.author);
      t.nw++;
      t.vw += a.views;
    }
    if (a.editor) {
      const t = touch(a.editor);
      t.ne++;
      t.ve += a.views;
      if (penulisDilewati) {
        t.nAdv++;
        if (alihkan) t.veAlih += a.views;
      }
    }
  });

  // pastikan orang yang hanya punya entri manual tetap muncul
  Object.keys(manual).forEach((n) => {
    if (roster[n] && roster[n] !== "Tidak dinilai") touch(n);
  });

  return Object.values(acc)
    .map((p) => {
      const role = roster[p.name] || "Reporter";
      if (role === "Tidak dinilai") return null;

      const tg = targets[role] || DEFAULT_TARGETS.Reporter;
      const tProd = Math.max(tg.prod * ratio, 1);
      const tViews = Math.max(tg.views * ratio, 1);

      const m = { ...MANUAL_KOSONG, ...(manual[p.name] || {}) };

      // --- produktivitas ---
      const dasar = EDITOR_ROLES.includes(role) ? p.ne : p.nw;
      const poinIndepth = m.ind * (poin.indepth ?? 1);
      const poinVideo =
        m.reels * poin.reels + m.pkg * poin.pkg + m.live * poin.live + m.vind * poin.vind;
      const count = dasar + poinIndepth + poinVideo;

      // --- kredit viewers ---
      const kreditArtikel = Math.round(
        params.cWriter * p.vw + params.cEditor * p.ve + params.cWriter * p.veAlih
      );
      const kreditVideo = Math.round(
        m.onsite * faktor.onsite + m.yt * faktor.yt +
        m.tt * faktor.tt + m.ig * faktor.ig + m.fb * faktor.fb
      );
      const credit = kreditArtikel + kreditVideo;

      const pProd = Math.min(count / tProd, params.cap);
      const pViews = Math.min(credit / tViews, params.cap);
      const score = params.wViews * pViews + params.wProd * pProd;
      const g = gradeOf(score);

      return {
        ...p,
        role, count, credit, tProd, tViews, pProd, pViews, score,
        dasar, poinIndepth, poinVideo, kreditArtikel, kreditVideo,
        nVideo: m.reels + m.pkg + m.live + m.vind,
        nIndepth: m.ind,
        adaManual: poinIndepth + poinVideo + kreditVideo > 0,
        vPart: params.wViews * pViews,
        pPart: params.wProd * pProd,
        grade: g.grade, label: g.label, reward: g.reward,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}

/** Ringkasan agregat untuk kartu statistik. */
export function summarise(results, articles) {
  const rewarded = results.filter((r) => r.reward > 0);
  return {
    people: results.length,
    articles: articles.length,
    views: articles.reduce((s, a) => s + a.views, 0),
    reward: rewarded.reduce((s, r) => s + r.reward, 0),
    rewarded: rewarded.length,
    avg: results.length
      ? results.reduce((s, r) => s + r.score, 0) / results.length
      : 0,
  };
}

/** Distribusi grade dan total reward, termasuk bonus top viewers. */
export function gradeRecap(results, report, topViewer) {
  const rows = TIERS.map((t) => {
    const n = results.filter((r) => r.grade === t.grade).length;
    return { grade: t.grade, label: t.label, reward: t.reward, n, total: t.reward * n };
  });
  const tierTotal = rows.reduce((s, r) => s + r.total, 0);
  const bonus = report.bonusOn && topViewer ? report.bonusAmount : 0;
  return { rows, tierTotal, bonus, grand: tierTotal + bonus };
}

/** Sepuluh pemeriksaan yang harus lolos sebelum angka dibagikan. */
export function runChecks({ articles, colMap, results, roster, params }) {
  const noEditor = articles.filter((a) => !a.editor).length;
  const noAuthor = articles.filter((a) => !a.author).length;
  const noViews = articles.filter((a) => !a.views).length;
  const unassigned = results.filter((r) => !roster[r.name]).length;
  const spacing = Object.keys(roster).filter((n) => n !== n.trim()).length;
  const n = (x) => new Intl.NumberFormat("id-ID").format(x);
  const p = (x) => (x * 100).toFixed(1) + "%";

  return [
    { ok: !!colMap.date, t: "Kolom tanggal terbaca", d: colMap.date || "tidak ditemukan — filter periode nonaktif" },
    { ok: !!colMap.views, t: "Kolom views terbaca", d: colMap.views || "tidak ditemukan — skor viewers akan nol" },
    { ok: !!colMap.editor, t: "Kolom editor terbaca", d: colMap.editor || "tidak ditemukan — kredit editor tidak terhitung" },
    { ok: noAuthor === 0, t: "Semua artikel punya penulis", d: noAuthor ? `${n(noAuthor)} artikel tanpa penulis` : "lengkap" },
    { ok: noEditor === 0, t: "Semua artikel punya editor", d: noEditor ? `${n(noEditor)} artikel tanpa editor` : "lengkap" },
    { ok: noViews === 0, t: "Semua artikel punya angka views", d: noViews ? `${n(noViews)} artikel bernilai nol` : "lengkap" },
    { ok: unassigned === 0, t: "Semua nama punya jabatan", d: unassigned ? `${unassigned} nama memakai jabatan bawaan` : "lengkap" },
    { ok: spacing === 0, t: "Penulisan nama rapi", d: spacing ? `${spacing} nama punya spasi berlebih` : "lengkap" },
    { ok: Math.abs(params.wViews + params.wProd - 1) < 1e-6, t: "Bobot berjumlah 100%", d: p(params.wViews + params.wProd) },
    { ok: Math.abs(params.cWriter + params.cEditor - 1) < 1e-6, t: "Kredit berjumlah 100%", d: p(params.cWriter + params.cEditor) },
  ];
}

/** Daftar preset periode (bulanan dan mingguan) dari tanggal yang ada di data. */
export function buildPresets(articles) {
  if (!articles.length) return { months: [], weeks: [] };
  const days = [...new Set(articles.map((a) => a.day).filter(Boolean))].sort();

  const months = [...new Set(days.map((d) => d.slice(0, 7)))].map((m) => {
    const inM = days.filter((d) => d.startsWith(m));
    return { key: m, from: inM[0], to: inM[inM.length - 1] };
  });

  const weeks = [];
  let cur = [];
  days.forEach((d) => {
    cur.push(d);
    if (new Date(d).getDay() === 0) {
      weeks.push(cur);
      cur = [];
    }
  });
  if (cur.length) weeks.push(cur);

  return {
    months,
    weeks: weeks.map((w, i) => ({ key: `M${i + 1}`, from: w[0], to: w[w.length - 1] })),
  };
}
