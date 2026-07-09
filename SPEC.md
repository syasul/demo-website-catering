# SPEC.md — Website Catering (Wedding & Event)
**Stack:** Laravel (REST API) + React (Vite) + Tailwind CSS
**Fitur andalan:** Kalkulator Estimasi Biaya Catering per Pax (adaptasi dari kalkulator harga per penumpang globalgatewayholiday.com)

---

## 1. Masalah yang Diselesaikan
1. Client (calon pengantin/EO) tidak tahu estimasi biaya sebelum chat admin — harga tergantung jumlah pax, paket, dan add-on.
2. Admin capek jawab simulasi harga berulang-ulang lewat WA/telepon.
3. Tidak ada satu tempat terpusat buat admin pantau lead masuk, follow-up, dan status closing.
4. Owner tidak punya data: paket terlaris, funnel closing, kenapa lead gagal deal.

**Solusi:** Kalkulator self-service di sisi user (transparan, real-time) + Admin Panel terpusat sebagai CRM mini (lead, follow-up, laporan).

---

## 2. Arsitektur & Stack
```
React (Vite) + Tailwind  --- REST API (Sanctum) ---  Laravel API  ---  MySQL/PostgreSQL
   |-- /              (publik, user)                     |
   |-- /admin         (admin panel, role-based)           |-- notifikasi: email + WhatsApp API (Fonnte/Wablas)
                                                            |-- real-time: Laravel Echo + Pusher/Soketi
```
- Satu backend Laravel melayani frontend publik & admin, dibedakan middleware `auth:sanctum` + role.
- Role: `super_admin`, `admin` (operasional), `finance`.

---

## 3. Skema Database (Ringkas)
- **categories** — id, name, slug
- **packages** — id, category_id, name, slug, description, price_per_pax, min_pax, max_pax, thumbnail, is_active
- **menu_items** — id, name, type (main_course/snack/dessert/beverage)
- **package_menu_item** — pivot
- **addons** — id, name, pricing_type (flat/per_pax), price
- **pricing_tiers** — id, package_id (nullable=global), min_pax, discount_percent
- **quotations** — id, package_id, snapshot harga+nama, pax, addon_ids/snapshot (json), event_date, event_location, subtotal, discount, total_estimate, customer_name/phone/email, notes, source, status (new/contacted/negotiation/deal/lost), assigned_to, lost_reason, timestamps
- **quotation_activities** — id, quotation_id, user_id, note, activity_type (call/wa/email/meeting/status_change), created_at
- **testimonials** — id, customer_name, event_type, rating, content, photo, is_published
- **galleries** — id, title, category_id, image, event_date, is_published
- **users** — id, name, email, password, role, phone, is_active
- **activity_logs** — id, user_id, action, model, model_id, before/after, created_at
- **contacts** — id, name, email, phone, message, created_at/updated_at

> Harga di `quotations` **wajib snapshot**, bukan cuma FK — supaya histori lead lama tidak berubah kalau harga paket diubah owner di kemudian hari.

---

## 4. Sistem Desain UI (arah visual — bukan template AI generik)

Banyak hasil AI jatuh ke 3 pola default: krem hangat+serif+terracotta, hitam pekat+neon tunggal, atau koran-hairline. Kita hindari itu — desain diturunkan dari dunia nyata bisnis ini: **kartu undangan pernikahan** + **nota/kwitansi catering asli**. Konsep: **"Nota Kebun" (Garden Ledger)**.

**Palet warna**
| Token | Hex | Peran |
|---|---|---|
| forest | `#1F2E22` | Background gelap (hero, sidebar admin), ink utama |
| paper | `#F5EFDF` | Background terang / kertas undangan |
| gold | `#AD8A4E` | Aksen foil emas — border, pemisah premium |
| maroon | `#6E2A2A` | CTA utama |
| sage | `#56705C` | Teks sekunder, status sukses/diskon |
| stempel | `#3B3350` | Aksen stempel tinta ungu — dipakai sangat terbatas |

**Tipografi**: `Fraunces` (display, headline & angka total — kesan kaligrafi undangan) · `Karla` (body, form) · `IBM Plex Mono` (angka kalkulator/nota/tabel admin — kesan mesin kasir).

**Signature element — "Nota Hidup"**: panel breakdown harga didesain seperti nota kwitansi asli — garis putus-putus "sobek di sini", stempel tinta ungu fade-in tiap total berubah, angka pakai monospace dengan count-up.

**Motion**: seperlunya — kartu undangan "terbuka" halus saat hero load, count-up + stempel saat total berubah, transisi admin minimal (fokus kecepatan data, bukan dekorasi).

**Restraint**: kemewahan visual dipusatkan HANYA di nota kalkulator. Form, tabel admin, navigasi dibuat tenang & fungsional.

---

## 5. HALAMAN SISI USER (Publik)

### 5.1 Landing Page (`/`)
**Tujuan halaman**: bangun kepercayaan dalam 5 detik pertama + arahkan ke kalkulator secepat mungkin.
- **Hero**: kartu undangan besar di atas background forest — headline "Berapa estimasi catering acaramu?", subheadline singkat, **CTA utama "Hitung Estimasi Biaya"** berbentuk pita/segel (bukan tombol rounded generik) → langsung ke `/kalkulator`. CTA sekunder ghost: "Lihat semua paket" → `/paket`.
- **Trust bar**: angka ringkas (mis. "500+ acara ditangani", "sejak 2015", rating testimoni) — statis, bukan section fitur 01/02/03.
- **Kategori event**: grid kartu (Wedding, Khitanan, Corporate, Lamaran) — klik → `/paket?kategori=...`.
- **Paket unggulan**: 3 kartu paket populer (foto, nama, "mulai dari Rp.../pax") + CTA "Hitung untuk paket ini" (prefill kalkulator).
- **Cara kerja kalkulator** (singkat, 4 langkah bernomor — ini valid karena memang sequence nyata): Pilih paket → Isi jumlah tamu → Pilih tambahan → Lihat estimasi.
- **Testimoni** (carousel ringkas, 3 tampil).
- **Galeri cuplikan** (6 foto, link "Lihat galeri lengkap" → `/galeri`).
- **CTA penutup** sebelum footer: ulangi tombol "Hitung Estimasi Biaya".
- **Footer**: kontak, WA floating button persist di semua halaman.

### 5.2 Daftar Paket (`/paket`)
- Filter kategori (chip/tab: semua, wedding, khitanan, corporate, dll).
- Sort: harga terendah/tertinggi.
- Grid `PackageCard`: foto, nama paket, kategori, "mulai dari Rp X/pax", min pax, tombol "Lihat detail" + tombol cepat "Hitung estimasi".
- Empty state kalau filter tidak ada hasil: ajakan lihat kategori lain.

### 5.3 Detail Paket (`/paket/:slug`)
- Galeri foto paket (carousel).
- Deskripsi paket + daftar menu (dikelompokkan: main course, snack, dessert, beverage).
- Harga per pax + minimum pax ditampilkan jelas di atas.
- Daftar add-on yang kompatibel (preview harga).
- **CTA sticky** (mobile: bottom bar, desktop: sidebar): "Hitung Estimasi untuk Paket Ini" → ke kalkulator dengan paket ter-prefill.

### 5.4 Kalkulator Estimasi Biaya (`/kalkulator`) — **halaman inti**
Alur 4 step, progress indicator di atas:
1. **Pilih kategori & paket** — card selectable, terisi otomatis jika datang dari halaman detail paket.
2. **Jumlah tamu (pax)** — slider + input angka manual, validasi real-time vs `min_pax`/`max_pax` paket, pesan error jelas ("Minimum pemesanan paket ini 100 pax").
3. **Pilih add-on** — checkbox list dengan harga masing-masing (flat/per-pax ditandai jelas).
4. **Ringkasan (Nota Hidup)** — breakdown real-time tanpa reload: subtotal paket, subtotal add-on, diskon tier (jika pax capai ambang), garis "sobek di sini", total besar (monospace + count-up), stempel "ESTIMASI".
- Tombol akhir: **"Kirim sebagai Permintaan Penawaran"** → buka form singkat (nama, no HP, tanggal acara, lokasi, catatan) → submit ke backend → tampilkan konfirmasi + opsi lanjut chat WhatsApp langsung dengan ringkasan otomatis ter-attach.

### 5.5 Galeri (`/galeri`)
- Grid foto per acara, filter kategori, lightbox saat diklik.

### 5.6 Tentang Kami (`/tentang-kami`)
- Cerita singkat bisnis, tim, sertifikasi/legalitas (jika ada), kenapa memilih mereka.

### 5.7 Kontak (`/kontak`)
- Form kontak umum (nama, kontak, pesan) untuk pertanyaan di luar kalkulator.
- Info alamat, jam operasional, peta lokasi (embed), tombol WA & telepon langsung.

### 5.8 FAQ (opsional, `/faq`)
- Pertanyaan umum: minimum pax, area jangkauan, DP, pembatalan, dll.

### 5.9 Komponen Reusable Sisi User
`Navbar`, `Footer`, `WhatsAppFloatingButton`, `PackageCard`, `CategoryFilter`, `PaxInputSlider`, `AddonCheckboxList`, `PriceBreakdownCard` (Nota Hidup), `QuotationForm`, `TestimonialCarousel`, `GalleryGrid`.

---

## 6. HALAMAN SISI ADMIN (SPA `/admin`, role-based)

### 6.1 Login (`/admin/login`)
- Form email + password (Sanctum), redirect sesuai role setelah login.

### 6.2 Dashboard (`/admin/dashboard`)
- Card ringkasan: lead baru minggu ini, lead perlu follow-up (>2 hari tanpa aktivitas), total nilai pipeline (Σ total_estimate status new+contacted+negotiation), deal bulan ini.
- Chart: tren lead per hari/minggu (line), distribusi status lead (donut), paket paling sering disimulasikan (bar).
- Widget "Perlu Ditindaklanjuti Hari Ini" — list lead stagnan.

### 6.3 Lead / Quotation (`/admin/leads`) — **CRM mini, halaman paling sering dipakai**
- **View Kanban** (default): kolom Baru → Dihubungi → Negosiasi → Deal / Batal, drag & drop update status.
- **View Tabel** (alternatif): filter tanggal, sumber, paket, status, assigned_to, search nama/HP.
- **Detail lead** (drawer): breakdown harga snapshot (paket, pax, add-on, diskon), tombol "Chat via WhatsApp" (deep-link `wa.me` + template pesan otomatis), tombol "Tandai Dihubungi"/"Ubah Status", timeline aktivitas + form catatan follow-up baru, field assign ke staff.
- Status "Batal" wajib isi alasan (dropdown: harga tinggi/pakai vendor lain/batal acara/lainnya) — masuk data laporan.
- Notifikasi real-time saat lead baru masuk (badge + toast).

### 6.4 Paket & Menu (`/admin/packages`)
- Tabel paket: thumbnail, kategori, harga/pax, min pax, toggle aktif/nonaktif cepat.
- Form tambah/edit: nama, kategori, deskripsi rich text, harga per pax, min/max pax, upload gambar (drag-drop+preview), pilih menu item, pilih add-on kompatibel.
- Tombol "Duplikat paket" (buat varian dari paket existing).
- Sub-halaman **Menu Item** (`/admin/menu-items`): CRUD nama + tipe, reusable lintas paket.
- Sub-halaman **Add-on** (`/admin/addons`): CRUD nama, tipe harga (flat/per-pax), harga, foto, mapping ke paket.

### 6.5 Harga & Diskon (`/admin/pricing-tiers`)
- Tabel tier diskon (mis. ≥250 pax = 5%, ≥500 pax = 10%), global atau per paket.
- Fitur "Coba simulasi": input angka pax contoh → preview hasil diskon sebelum disimpan.

### 6.6 Galeri (`/admin/galleries`)
- Bulk upload foto per acara, judul, kategori, tanggal, toggle publish/unpublish.

### 6.7 Testimoni (`/admin/testimonials`)
- CRUD nama client, jenis acara, rating, isi, foto, toggle tampil di homepage.

### 6.8 Laporan (`/admin/reports`)
- **Lead per bulan/sumber** — grafik + tabel + export Excel/CSV.
- **Paket terpopuler** — dua metrik: jumlah simulasi kalkulator vs jumlah deal (insight harga/positioning).
- **Funnel konversi** — Baru→Dihubungi→Negosiasi→Deal dengan % drop-off tiap tahap.
- **Rata-rata nilai deal & rata-rata pax per deal**.

### 6.9 Manajemen User (`/admin/users`, super-admin only)
- CRUD staff + assign role (super_admin/admin/finance).

### 6.10 Activity Log (`/admin/activity-log`, super-admin only)
- Audit trail: siapa mengubah harga/paket/add-on, kapan, before→after value.

### 6.11 Pengaturan (`/admin/settings`)
- Info kontak bisnis (no WA CS, email, alamat) yang tampil di frontend publik.
- Template pesan WhatsApp otomatis untuk tombol "Chat via WhatsApp".
- Daftar penerima notifikasi lead baru (email/WA).

### 6.12 Permission Matrix
| Fitur | Super Admin | Admin Operasional | Finance |
|---|---|---|---|
| Kelola paket/menu/add-on/kategori | v | v | read-only |
| Kelola pricing tier | v | read-only | v |
| Lihat & follow-up lead | v | v | read-only |
| Ubah status lead | v | v | x |
| Kelola galeri & testimoni | v | v | x |
| Kelola user & role | v | x | x |
| Laporan & export | v | terbatas | v |
| Activity log | v | x | x |

---

## 7. API Contract Ringkas
```
# Publik
GET  /api/categories
GET  /api/packages?category_id=&sort=
GET  /api/packages/{slug}
GET  /api/addons
POST /api/calculator/estimate      { package_id, pax, addon_ids[] } -> breakdown lengkap
POST /api/quotations                { ...form + hasil kalkulasi } -> simpan lead + notifikasi admin
GET  /api/testimonials
GET  /api/galleries
POST /api/contact

# Admin (auth:sanctum + role)
GET   /api/admin/leads?status=&assigned_to=&search=
POST  /api/admin/leads/{id}/activities   { note, activity_type }
PATCH /api/admin/leads/{id}/status       { status, lost_reason? }
PATCH /api/admin/leads/{id}/assign       { user_id }
GET   /api/admin/reports/funnel
GET   /api/admin/reports/popular-packages
GET   /api/admin/reports/leads-by-month
POST/PUT/DELETE /api/admin/packages, /menu-items, /addons, /pricing-tiers
POST  /api/admin/pricing-tiers/preview   { pax, package_id } -> simulasi tanpa simpan
GET   /api/admin/activity-logs
```
