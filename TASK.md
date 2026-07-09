# TASK.md — Website Catering (Wedding & Event) 
**Stack:** Laravel (API/Backend) + React (Frontend) + Tailwind CSS  
**Referensi fitur:** globalgatewayholiday.com (kalkulator harga per penumpang) → diadaptasi menjadi **Kalkulator Estimasi Biaya Catering per Pax**

---

## 0. Masalah Client yang Harus Diselesaikan
- Client (calon pengantin / event organizer) sering harus WA/telepon dulu untuk tahu estimasi harga catering, padahal harga sangat bergantung pada **jumlah pax (tamu)**, **paket menu**, dan **add-on** (dekorasi meja, live cooking, dessert table, dll).
- Admin catering capek jawab pertanyaan "kalau tamu 300 orang jadi berapa?" berkali-kali secara manual.
- Tidak ada cara bagi calon client untuk **self-service simulasi harga** sebelum menghubungi CS.
- Tujuan utama proyek: buat kalkulator otomatis di website (mirip kalkulator tour per penumpang di referensi), tapi basisnya **per pax catering**, sehingga:
  - Client input jumlah tamu → pilih paket → pilih add-on → langsung lihat estimasi total.
  - Estimasi bisa langsung dikirim sebagai "Request Quotation" ke admin (lead generation).

---

## 1. FASE PERSIAPAN (Planning & Setup)
- [x] Kumpulkan data existing: daftar paket catering, harga per pax, minimum pax per paket, foto menu.
- [x] Tentukan kategori event: Wedding, Khitanan, Ulang Tahun, Corporate/Gathering, Ta'aruf/Lamaran, dll.
- [x] Tentukan struktur paket: Paket Hemat / Reguler / Premium / Custom.
- [x] Setup repo Git (monorepo atau split `backend/` & `frontend/`).
- [x] Setup environment:
  - [x] Install Laravel (versi terbaru, mode API only / Sanctum untuk auth).
  - [x] Install React (Vite) + Tailwind CSS.
  - [x] Setup CORS Laravel ↔ React.
  - [x] Setup database (MySQL/PostgreSQL) + `.env`.
  - [x] Setup storage untuk upload gambar menu (local/S3).

---

## 2. BACKEND — Laravel (API)

### 2.1 Database & Model
- [x] Migration & Model `categories` (jenis event: wedding, khitanan, dll).
- [x] Migration & Model `packages` (paket catering: nama, deskripsi, harga_per_pax, min_pax, kategori_id, gambar).
- [x] Migration & Model `menu_items` (isi menu tiap paket: nasi, lauk, dessert, snack box, dll — many-to-many ke packages).
- [x] Migration & Model `addons` (dekorasi, tenda, MC, live cooking, dessert table — punya `harga_satuan` atau `harga_per_pax` + tipe flat/per-pax).
- [x] Migration & Model `package_addon` (pivot, jika addon spesifik per paket - addon terpetakan secara fleksibel).
- [x] Migration & Model `quotations` (hasil kalkulasi yang disimpan saat client submit request: nama, kontak, tanggal_acara, jumlah_pax, paket_id, addon_ids, subtotal, diskon, total_estimasi, status).
- [x] Migration & Model `testimonials`.
- [x] Migration & Model `galleries` (portfolio acara terdahulu).
- [x] Migration & Model `users` (admin, role: super-admin/staff).
- [x] Seeder untuk data dummy (paket + harga + addon).

### 2.2 API Endpoints (Public)
- [x] `GET /api/categories`
- [x] `GET /api/packages` (filter by kategori, sort by harga)
- [x] `GET /api/packages/{slug}` (detail paket + menu item + addon yang kompatibel)
- [x] `GET /api/addons`
- [x] `POST /api/calculator/estimate` → **inti fitur kalkulator**:
  - Input: `package_id`, `jumlah_pax`, `addon_ids[]`
  - Logic:
    - Validasi `jumlah_pax >= min_pax` paket tsb.
    - Hitung subtotal = `harga_per_pax * jumlah_pax`.
    - Tambahkan biaya addon (flat atau per-pax dikali jumlah_pax).
    - Terapkan tiered discount jika ada (misal >500 pax dapat diskon 10%).
    - Return breakdown lengkap (bukan cuma total, biar transparan ke client).
- [x] `POST /api/quotations` (submit hasil kalkulasi jadi lead/request penawaran resmi, kirim notifikasi email/WA ke admin).
- [x] `GET /api/testimonials`
- [x] `GET /api/galleries`
- [x] `POST /api/contact` (form kontak umum)

### 2.3 API Endpoints (Admin — protected via Sanctum)
- [x] Auth: login/logout admin.
- [x] CRUD `packages`, `menu_items`, `addons`, `categories`.
- [x] CRUD `galleries`, `testimonials`.
- [x] List & update status `quotations` (baru → dihubungi → deal → batal).
- [x] Dashboard ringkas: jumlah quotation masuk per bulan, paket terpopuler.
- [ ] Export quotation ke Excel/PDF (opsional, fase lanjutan).

### 2.4 Non-Fungsional
- [x] Validasi request (Form Request / Request validation) untuk semua endpoint kalkulator & quotation.
- [x] Rate limiting endpoint publik (`throttle`) untuk cegah spam.
- [x] Notifikasi (Laravel Notification) via email/WhatsApp API (fonnte/twilio - deep link WA terkonfigurasi dengan template dinamis).
- [x] Logging & error handling terstandar (JSON response format konsisten).
- [x] Unit test untuk logic kalkulator (harga, diskon, min pax) — ini paling kritikal, harus 100% akurat.

---

## 3. FRONTEND — React + Tailwind

### 3.1 Setup
- [x] Setup routing (React Router).
- [x] Setup state management ringan (React Query/TanStack Query untuk fetch API + Zustand/Context untuk state kalkulator).
- [x] Setup Tailwind config (warna brand, font, spacing custom).
- [x] Setup layout dasar: Navbar, Footer, Layout wrapper.

### 3.2 Halaman Publik
- [x] **Home**: Hero section, kategori event, paket unggulan, testimoni, CTA ke kalkulator.
- [x] **Daftar Paket** (`/paket`): filter kategori (wedding/khitanan/dll), grid card paket dengan harga "mulai dari .../pax".
- [x] **Detail Paket** (`/paket/:slug`): deskripsi, daftar menu, galeri foto, tombol "Hitung Estimasi Biaya".
- [x] **Kalkulator Estimasi Biaya** (`/kalkulator`) — **fitur utama**:
  - Step 1: pilih kategori event & paket.
  - Step 2: input jumlah tamu (pax) — slider + input angka.
  - Step 3: pilih add-on (checkbox multi-select dengan harga masing-masing).
  - Step 4: tampilkan breakdown real-time (update otomatis tiap input berubah, tanpa reload — mirip UX kalkulator tour di referensi).
  - Step 5: tombol "Kirim sebagai Permintaan Penawaran" → form kontak singkat → submit ke `/api/quotations`.
- [x] **Galeri** (`/galeri`).
- [x] **Tentang Kami** (`/tentang-kami`).
- [x] **Kontak** (`/kontak`) + tombol WA langsung.
- [ ] FAQ (opsional).

### 3.3 Komponen Reusable
- [x] `PackageCard`
- [x] `CategoryFilter`
- [x] `PaxInputSlider`
- [x] `AddonCheckboxList`
- [x] `PriceBreakdownCard` (rincian biaya real-time)
- [x] `QuotationForm` (modal/step terakhir kalkulator)
- [x] `TestimonialCarousel`
- [x] `GalleryGrid`
- [x] `Navbar`, `Footer`, `WhatsAppFloatingButton`

### 3.4 Admin Panel (SPA React terpisah di `/admin`, role-based: super-admin/admin operasional/finance)

**Auth & Layout**
- [x] Login admin (Sanctum) + guard route per role.
- [x] Layout admin: sidebar navigasi, topbar (notifikasi real-time lead baru, profil).
- [x] Middleware frontend: redirect ke login jika token expired.

**Dashboard**
- [x] Card ringkasan: lead baru minggu ini, lead perlu follow-up (>2 hari tanpa aktivitas), total nilai pipeline, deal bulan ini.
- [x] Chart tren lead per hari/minggu (line chart).
- [x] Chart distribusi status lead (donut).
- [x] Chart paket paling sering disimulasikan di kalkulator (bar chart).
- [x] Widget list "Perlu Ditindaklanjuti Hari Ini".

**Kelola Lead / Quotation (CRM mini)**
- [x] Tampilan Kanban (Baru → Dihubungi → Negosiasi → Deal/Batal) dengan drag & drop update status.
- [x] Tampilan tabel alternatif + filter (tanggal, sumber, paket, status, assigned_to, search).
- [x] Drawer/modal detail lead: breakdown harga snapshot, tombol "Chat via WhatsApp" (deep-link wa.me + template pesan), tombol tandai dihubungi/ubah status.
- [x] Timeline aktivitas per lead + form tambah catatan follow-up.
- [x] Fitur assign lead ke staff tertentu.
- [x] Modal wajib isi alasan saat status diubah ke "Batal" (Status: Lost).
- [x] Notifikasi real-time (Laravel Echo/Pusher) saat lead baru masuk.

**Kelola Paket & Menu**
- [x] List paket (tabel + thumbnail + toggle aktif/nonaktif cepat).
- [x] Form tambah/edit paket (deskripsi rich text, upload gambar drag-drop, pilih menu item, pilih add-on kompatibel).
- [x] Fitur duplikat paket.
- [x] CRUD menu item (reusable lintas paket).
- [x] CRUD add-on (tipe harga flat/per-pax, foto opsional, mapping ke paket).

**Harga & Diskon**
- [x] CRUD pricing tier (diskon bertingkat berdasar jumlah pax, global atau per paket).
- [x] Fitur preview simulasi diskon sebelum disimpan.

**Galeri & Testimoni**
- [x] Upload galeri (bulk upload foto per acara) + toggle publish.
- [x] CRUD testimoni + toggle tampil di homepage.

**Laporan**
- [x] Laporan lead per bulan/sumber (grafik + export Excel/CSV).
- [x] Laporan paket terpopuler (berdasar simulasi kalkulator vs jumlah deal).
- [x] Laporan funnel konversi (Baru→Dihubungi→Negosiasi→Deal) dengan drop-off rate.
- [x] Laporan rata-rata nilai deal & rata-rata pax per deal.

**Manajemen User & Activity Log (super-admin only)**
- [x] CRUD user staff + assign role (super_admin/admin/finance).
- [x] Halaman activity log (audit trail perubahan harga/paket, siapa & kapan).

**Pengaturan**
- [x] Form info kontak bisnis (no WA CS, email, alamat) yang tampil di frontend publik.
- [x] Editor template pesan WhatsApp otomatis.
- [x] Pengaturan siapa saja penerima notifikasi lead baru.

### 3.5 UX & Responsif
- [x] Mobile-first (mayoritas calon client akan cek dari HP saat cari vendor catering).
- [x] Loading state & skeleton saat fetch data.
- [x] Validasi input (misal jumlah pax tidak boleh di bawah minimum paket) dengan pesan error yang jelas.
- [x] Animasi ringan (Framer Motion opsional) untuk transisi step kalkulator.

---

## 4. QA & TESTING
- [x] Test kalkulator dengan berbagai skenario (pax minimum, pax besar, dengan/tanpa addon, dengan diskon tier).
- [x] Test responsif di berbagai device.
- [x] Test performa API (response time endpoint `/calculator/estimate`).
- [ ] User Acceptance Test bareng client (owner catering) — pastikan logika harga sesuai cara hitung manual mereka selama ini.

## 5. DEPLOYMENT
- [ ] Setup server (VPS/shared hosting yang support Laravel + Node build untuk React).
- [ ] Setup domain & SSL.
- [ ] CI/CD sederhana (GitHub Actions) untuk build & deploy.
- [ ] Setup backup database berkala.
- [ ] Setup monitoring uptime (misal UptimeRobot).

## 6. PASCA-LAUNCH
- [ ] Training admin cara pakai panel & cara update harga paket.
- [ ] Kumpulkan feedback client 2–4 minggu pertama.
- [ ] Iterasi fitur lanjutan: integrasi payment DP online, integrasi kalender availability tanggal acara, WhatsApp bot auto-reply quotation.
