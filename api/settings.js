/**
 * API pengaturan bersama.
 *
 * GET  /api/settings  -> ambil pengaturan yang tersimpan di server
 * POST /api/settings  -> simpan pengaturan baru
 *
 * Menyimpan ke Redis lewat REST API Upstash. Variabel lingkungan diisi otomatis
 * oleh Vercel saat Anda menghubungkan penyimpanan Redis ke project ini.
 *
 * Bila variabel belum diatur, endpoint menjawab 503 dan aplikasi otomatis
 * kembali menyimpan di peramban masing-masing. Jadi aplikasi tetap jalan
 * meski penyimpanan server belum sempat disiapkan.
 */

const REDIS_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const KEY = "kpi-redaksi:settings";
const MAX_BYTES = 512 * 1024; // 512 KB, jauh di atas kebutuhan wajar

async function redis(command) {
  const r = await fetch(REDIS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error(`Redis menjawab ${r.status}`);
  return r.json();
}

/** Pastikan yang dikirim memang berbentuk pengaturan, bukan sembarang data. */
function valid(body) {
  if (!body || typeof body !== "object") return false;
  const keys = ["roster", "params", "targets", "report"];
  if (!keys.some((k) => k in body)) return false;
  if (body.roster && typeof body.roster !== "object") return false;
  if (body.params && typeof body.params !== "object") return false;
  if (body.targets && typeof body.targets !== "object") return false;
  if (body.report && typeof body.report !== "object") return false;
  return true;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!REDIS_URL || !REDIS_TOKEN) {
    return res.status(503).json({
      error: "belum_dikonfigurasi",
      pesan:
        "Penyimpanan server belum disiapkan. Hubungkan Redis di dashboard Vercel.",
    });
  }

  try {
    if (req.method === "GET") {
      const { result } = await redis(["GET", KEY]);
      return res.status(200).json(result ? JSON.parse(result) : null);
    }

    if (req.method === "POST") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      if (!valid(body)) {
        return res
          .status(400)
          .json({ error: "bentuk_tidak_dikenali", pesan: "Isi pengaturan tidak sesuai." });
      }

      const payload = {
        roster: body.roster || {},
        params: body.params || {},
        targets: body.targets || {},
        report: body.report || {},
        updatedAt: new Date().toISOString(),
        updatedBy: String(body.updatedBy || "").slice(0, 60) || "tanpa nama",
      };

      const text = JSON.stringify(payload);
      if (text.length > MAX_BYTES) {
        return res
          .status(413)
          .json({ error: "terlalu_besar", pesan: "Pengaturan melebihi batas ukuran." });
      }

      await redis(["SET", KEY, text]);
      return res
        .status(200)
        .json({ ok: true, updatedAt: payload.updatedAt, updatedBy: payload.updatedBy });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "metode_tidak_didukung" });
  } catch (e) {
    return res.status(500).json({
      error: "gagal_di_server",
      pesan: "Tidak bisa menghubungi penyimpanan. Coba lagi sebentar lagi.",
    });
  }
}
