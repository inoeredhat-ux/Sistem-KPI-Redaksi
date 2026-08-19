# Papan KPI Redaksi

Alat penilaian kinerja redaksi berbasis dua komponen: **60% viewers + 40% produktivitas**.
Unggah file export CMS, pilih periode, laporan langsung jadi.

Dibuat untuk Inilah.com. Berjalan sepenuhnya di peramban — data artikel tidak pernah dikirim ke server mana pun.

---

## Menjalankan di komputer sendiri

Butuh Node.js versi 18 atau lebih baru.

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

Untuk menguji hasil build produksi:

```bash
npm run build
npm run preview
```

---

## Deploy ke Vercel

### Cara 1 — lewat GitHub (disarankan)

1. Buat repository baru di GitHub, lalu unggah seluruh isi folder ini.
2. Buka [vercel.com/new](https://vercel.com/new), pilih repository tersebut.
3. Vercel mengenali Vite secara otomatis. Biarkan pengaturannya apa adanya:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Klik **Deploy**. Selesai dalam sekitar satu menit.

Setiap kali Anda mengubah kode dan melakukan push ke GitHub, Vercel membangun ulang secara otomatis.

### Cara 2 — lewat terminal

```bash
npm i -g vercel
vercel
```

Ikuti pertanyaannya, lalu `vercel --prod` untuk rilis resmi.

### Tidak ada environment variable

Aplikasi ini tidak butuh kunci API, basis data, atau variabel rahasia apa pun.

---

## Kenapa tidak memakai basis data

Pengaturan yang perlu disimpan hanya jabatan tiap orang, target, bobot, dan nama penanda tangan.
Semuanya berubah paling sering beberapa kali setahun dan dipakai satu sampai dua orang.

Menambahkan basis data berarti menambahkan autentikasi, biaya hosting bulanan, dan satu titik
kegagalan baru — tanpa manfaat yang sepadan untuk kebutuhan sebesar ini.

Karena itu pengaturan disimpan di `localStorage` peramban. Untuk memindahkannya ke komputer lain,
buka tab **Jabatan** lalu gunakan tombol **Ekspor pengaturan**. Hasilnya satu file JSON kecil yang
bisa dikirim lewat WhatsApp atau email, dan dimuat kembali dengan tombol **Impor**.

Bila suatu saat butuh basis data — misalnya agar setiap wartawan bisa masuk dan melihat
angkanya sendiri — file `src/lib/storage.js` adalah satu-satunya berkas yang perlu diganti.
Seluruh logika perhitungan di `src/lib/kpi.js` tidak perlu disentuh.

---

## Struktur folder

```
kpi-redaksi/
├── index.html                  Halaman dasar, memuat font Google
├── package.json                Daftar dependensi dan perintah
├── vite.config.js              Konfigurasi build
├── tailwind.config.js          Warna dan huruf
├── postcss.config.js
├── vercel.json                 Pengalihan rute untuk aplikasi satu halaman
├── .gitignore
└── src/
    ├── main.jsx                Titik masuk React
    ├── index.css               Tailwind + aturan cetak A4
    ├── App.jsx                 Pengatur utama: state, tab, perakitan komponen
    ├── lib/
    │   ├── constants.js        Target, bobot, tier reward, jabatan, teks laporan
    │   ├── format.js           Format angka, persen, rupiah, tanggal Indonesia
    │   ├── parse.js            Baca file CMS, deteksi nama kolom otomatis
    │   ├── kpi.js              Seluruh logika perhitungan (murni, tanpa UI)
    │   ├── storage.js          Simpan pengaturan + ekspor/impor JSON
    │   └── exportXlsx.js       Pembuat file Excel dan teks WhatsApp
    └── components/
        ├── ui.jsx              Tombol, kartu statistik, lencana grade, batang skor
        ├── UploadZone.jsx      Tampilan awal dan area unggah
        ├── Standings.jsx       Tabel klasemen
        ├── ReportTab.jsx       Pratinjau laporan bulanan + pengaturan tanda tangan
        ├── RosterTab.jsx       Pengaturan jabatan tiap nama
        ├── RulesTab.jsx        Bobot, target, tabel grade
        ├── ChecksTab.jsx       Sepuluh pemeriksaan data
        └── DetailDrawer.jsx    Daftar artikel per orang
```

---

## Cara pakai

**Unggah.** Seret file export CMS ke area unggah. Format `.xlsx`, `.xls`, atau `.csv`.
Nama kolom dikenali otomatis — `published_at`, `author`, `editor`, `view_count`, `title`
beserta padanan bahasa Indonesianya. Urutan kolom bebas.

**Atur jabatan.** Buka tab **Jabatan**. Aplikasi menebak awal: nama yang menyunting minimal
20 artikel diberi jabatan Redaktur, sisanya Reporter. Perbaiki yang keliru, lalu tekan Simpan.
Cukup sekali; unggahan berikutnya memakai pengaturan yang sama.

Pilih **Tidak dinilai** untuk byline seperti Advertorial atau kontributor tamu.

**Pilih periode.** Tersedia tombol cepat per bulan dan per minggu, atau isi tanggal bebas.
Sakelar **Prorata target** menyesuaikan target dengan jumlah hari yang dipilih — penting agar
laporan mingguan tidak membuat semua orang tampak gagal.

**Periksa data.** Buka tab **Cek data**. Bila ada angka merah di menu, selesaikan dulu sebelum
angka dibagikan ke tim.

**Terbitkan.** Tab **Laporan** menyediakan pratinjau lengkap dengan blok tanda tangan.
Tombol **Cetak** menghasilkan tata letak A4 lanskap siap ditandatangani.
Tombol **Unduh laporan .xlsx** menghasilkan empat sheet: laporan utama, rekap reward,
skema penilaian, dan seluruh data artikel sebagai lampiran bukti.

---

## Rumus

```
kredit viewers = (60% × views artikel yang ditulis)
               + (40% × views artikel yang disunting)

% viewers      = min(kredit viewers / target viewers, 200%)
% produktivitas= min(jumlah artikel / target produktivitas, 200%)

skor KPI       = (60% × % viewers) + (40% × % produktivitas)
```

Batas 200% mencegah satu artikel viral memborong seluruh pool reward.

Untuk jabatan redaktur, jumlah artikel dihitung dari yang **disunting**.
Untuk reporter, dari yang **ditulis**.

Bila satu orang menulis sekaligus menyunting artikel yang sama, ia menerima
60% + 40% = 100% kredit. Ini memang dikehendaki.

Seluruh angka pada rumus di atas dapat diubah di tab **Aturan**.

---

## Catatan teknis

**Warna sel Excel.** Pustaka `xlsx` versi komunitas tidak menulis warna latar dan huruf tebal.
Struktur, penggabungan sel, lebar kolom, dan format angka tetap tersimpan. Untuk laporan
berwarna, buka sekali di Excel, beri warna, lalu simpan sebagai template.

**Privasi.** Tidak ada data yang dikirim ke server. Seluruh pembacaan file dan perhitungan
terjadi di peramban. Aplikasi tetap berfungsi tanpa koneksi internet setelah halaman dimuat.

**Ukuran bundle.** Sekitar 200 kB terkompresi, sebagian besar dari pustaka pembaca Excel.
Sudah dipisah menjadi potongan terpisah agar cache peramban lebih awet.
