# ANALISIS USABILITAS DAN DESAIN ANTARMUKA
## Sistem Manajemen Inventory & Kasir - Gudang Amanah Lintang

---

## I. PENDAHULUAN

### A. Latar Belakang

Usabilitas dan desain antarmuka merupakan faktor penting dalam kesuksesan sebuah sistem informasi. Website dengan usabilitas baik akan meningkatkan efisiensi kerja, mengurangi kesalahan pengguna, dan meningkatkan kepuasan pengguna. Sistem manajemen gudang dan kasir memerlukan antarmuka yang intuitif karena digunakan dalam operasional harian yang membutuhkan kecepatan dan akurasi.

### B. Tujuan Proyek

1. Mengevaluasi tingkat usabilitas sistem manajemen Gudang Amanah Lintang
2. Mengidentifikasi kekuatan dan kelemahan desain antarmuka
3. Memberikan rekomendasi perbaikan berdasarkan prinsip HCI
4. Meningkatkan efisiensi dan kepuasan pengguna

### C. Ruang Lingkup

Analisis mencakup:
- Halaman Login
- Dashboard
- Halaman Kasir (POS)
- Manajemen Inventory
- Manajemen Varian Produk
- Riwayat Stok
- Laporan

### D. Metodologi

1. **Heuristic Evaluation**: Evaluasi berdasarkan 10 prinsip usabilitas Nielsen
2. **Cognitive Walkthrough**: Simulasi tugas pengguna
3. **Interface Analysis**: Analisis visual dan interaksi

---

## II. STUDI PENDAHULUAN

### A. Deskripsi Website/Aplikasi

**Nama**: Sistem Manajemen Inventory & Kasir - Gudang Amanah Lintang

**Tujuan**: Sistem berbasis web untuk mengelola inventory air mineral dan melakukan transaksi penjualan di gudang distributor.

**Fitur Utama**:
1. Autentikasi berbasis role (Admin & Kasir)
2. Dashboard dengan visualisasi data
3. Point of Sale untuk transaksi penjualan
4. Manajemen inventory dan stok
5. Laporan penjualan dan stok

**Target Pengguna**:
- **Admin Gudang**: Mengelola inventory, melihat laporan
- **Kasir**: Melakukan transaksi penjualan

### B. Teori Usabilitas

**Definisi Usabilitas (ISO 9241-11)**:
Tingkat kemampuan produk untuk digunakan oleh pengguna tertentu dalam mencapai tujuan dengan efektivitas, efisiensi, dan kepuasan.

**10 Prinsip Heuristic Nielsen**:
1. Visibility of system status
2. Match between system and real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize and recover from errors
10. Help and documentation

**Metrik Usabilitas**:
- **Learnability**: Kemudahan mempelajari sistem
- **Efficiency**: Kecepatan menyelesaikan tugas
- **Memorability**: Kemudahan mengingat setelah tidak digunakan
- **Errors**: Frekuensi kesalahan pengguna
- **Satisfaction**: Kepuasan pengguna

### C. Prinsip Dasar Antarmuka

**Gestalt Principles**:
- Proximity: Elemen terkait dikelompokkan berdekatan
- Similarity: Elemen serupa memiliki tampilan konsisten
- Continuity: Mata mengikuti pola yang berkelanjutan

**Fitts' Law**: Tombol penting harus besar dan mudah dijangkau.

**Hick's Law**: Kurangi jumlah pilihan untuk mempercepat keputusan.

**Design Principles**:
- Hierarchy: Struktur visual yang jelas
- Consistency: Elemen berperilaku sama
- Feedback: Respons terhadap aksi pengguna
- Affordance: Petunjuk visual cara penggunaan

---

## III. METODE PENELITIAN

### A. Metode Pengumpulan Data

**1. Heuristic Evaluation**
Evaluasi berdasarkan 10 prinsip Nielsen dengan severity rating:
- 0: Tidak ada masalah
- 1: Cosmetic (prioritas rendah)
- 2: Minor (prioritas menengah)
- 3: Major (prioritas tinggi)
- 4: Catastrophic (harus segera diperbaiki)

**2. Cognitive Walkthrough**
Simulasi skenario tugas:
- Kasir melakukan transaksi penjualan
- Admin menambahkan stok produk
- Admin melihat laporan penjualan

**3. Interface Analysis**
Analisis desain visual, elemen interaktif, feedback system, dan responsivitas.

### B. Instrumen Penelitian

- Checklist Heuristic Evaluation
- Task Scenario Cards
- Screenshot Documentation
- Severity Rating Matrix

### C. Prosedur Penelitian

1. **Persiapan**: Setup sistem dan pembuatan checklist
2. **Pengumpulan Data**: Evaluasi setiap halaman dan dokumentasi
3. **Analisis**: Kompilasi temuan dan penilaian severity
4. **Rekomendasi**: Prioritasi perbaikan dan dokumentasi

---

## IV. ANALISIS USABILITAS

### A. Tingkat Usabilitas Per Fungsi

#### 1. Halaman Login

**(Lampirkan Screenshot: Halaman Login)**

**Kekuatan**:
- Tampilan modern dengan gradient background
- Validasi real-time (username min 3 karakter, password min 6 karakter)
- Pesan error yang jelas dan spesifik
- Animasi feedback visual saat error
- Tombol show/hide password
- Loading indicator saat login
- Auto-redirect berdasarkan role

**Kelemahan**:
- Tidak ada fitur "Remember Me"
- Tidak ada fitur "Forgot Password"
- Tidak ada warning Caps Lock aktif

**Score**: 8.0/10

---

#### 2. Dashboard

**(Lampirkan Screenshot: Dashboard)**

**Kekuatan**:
- Information architecture yang jelas (4 card metrics)
- Visualisasi data dengan bar chart
- Warna konsisten (biru=penjualan, hijau=keuntungan, merah=alert)
- Format Rupiah yang konsisten
- Grid layout responsif
- Icon yang relevan

**Kelemahan**:
- Tidak ada tombol refresh manual
- Chart tidak interaktif
- Tidak ada filter periode waktu

**Score**: 8.5/10

---

#### 3. Halaman Kasir (POS)

**(Lampirkan Screenshot: Halaman Kasir)**

**Kekuatan**:
- Layout 2 kolom jelas (produk & keranjang)
- Search bar untuk mencari produk
- Stok ditampilkan jelas
- Tombol disabled otomatis jika stok habis
- Validasi real-time untuk qty dan harga
- Highlight merah pada input invalid
- Kalkulasi total otomatis
- Modal struk transaksi informatif
- Fitur cetak invoice

**Kelemahan**:
- Input harga jual manual (rawan error)
- Tidak ada quantity selector cepat
- Tidak ada kalkulator kembalian
- Tidak ada input metode pembayaran

**Score**: 7.5/10

---

#### 4. Manajemen Inventory

**(Lampirkan Screenshot: Inventory)**

**Kekuatan**:
- Tabel rapi dengan informasi lengkap
- Badge merah untuk stok < 10
- Modal form tidak mengganggu
- Konfirmasi sebelum delete
- Tombol aksi dengan icon jelas

**Kelemahan**:
- Tidak ada search/filter produk
- Tidak ada pagination
- Tidak ada bulk actions
- Tidak ada sort kolom

**Score**: 7.0/10

---

#### 5. Riwayat Stok

**(Lampirkan Screenshot: Riwayat Stok)**

**Kekuatan**:
- Filter lengkap (search, produk, varian, date range)
- Visual indicator untuk filter aktif
- Summary cards informatif
- Export ke Excel dan PDF

**Kelemahan**:
- Tidak ada pagination
- Tidak bisa edit/delete entry

**Score**: 8.0/10

---

#### 6. Laporan

**(Lampirkan Screenshot: Laporan)**

**Kekuatan**:
- Tab navigation untuk 3 jenis laporan
- Filter date range
- Data komprehensif
- Export Excel dan PDF

**Kelemahan**:
- Tidak ada preview sebelum export
- Tidak ada visualisasi chart

**Score**: 7.5/10

---

### B. Desain Antarmuka

#### 1. Visual Design

**(Lampirkan Screenshot: Color Palette dan Typography)**

**Color Palette**:
- Primary (Blue): Aksi utama dan interaktif
- Success (Green): Notifikasi sukses
- Warning (Yellow): Alert
- Danger (Red): Error dan delete
- Neutral (Gray): Teks dan background

**Evaluasi**: Kontras baik, accessible, konsisten.

**Typography**:
- Heading: Bold dengan hierarki jelas
- Body: 14-16px readable
- Caption: 12px untuk metadata

**Evaluasi**: Hierarki jelas, ukuran nyaman dibaca.

**Spacing & Layout**:
- Spacing konsisten (4px, 8px, 16px, 24px)
- Whitespace cukup, tidak cramped

**Evaluasi**: Layout bersih dan mudah di-scan.

---

#### 2. Elemen Interaktif

**(Lampirkan Screenshot: Button States, Forms, Modals, Toast)**

**Buttons**:
- Hover state: Perubahan warna jelas
- Disabled state: Opacity berkurang
- Loading state: Spinner animation
- Icon + Text yang jelas

**Forms**:
- Validasi real-time dengan border merah
- Error message spesifik
- Label jelas

**Modals**:
- Dark backdrop untuk fokus
- Animasi smooth
- Color-coded berdasarkan jenis

**Toast Notifications**:
- Color-coded berdasarkan tipe
- Auto-dismiss 3 detik
- Slide-in animation

**Evaluasi**: Feedback visual sudah baik.

---

#### 3. Responsiveness

**(Lampirkan Screenshot: Desktop vs Mobile)**

**Desktop**: Layout multi-column optimal
**Tablet**: Cards menjadi 2 kolom
**Mobile**: Stack vertikal 1 kolom

**Masalah Kritis**: Sidebar tidak collapse di mobile (memakan banyak space).

---

### C. Temuan Utama

#### Kekuatan Sistem

| Aspek | Score |
|-------|-------|
| Consistency | 9/10 |
| Visual Feedback | 8.5/10 |
| Error Prevention | 8/10 |
| Visual Design | 8.5/10 |

#### Masalah Usabilitas

| No | Masalah | Lokasi | Severity |
|----|---------|--------|----------|
| 1 | Tidak ada pagination | Inventory, Riwayat | High (3) |
| 2 | Sidebar tidak collapse (mobile) | Semua halaman | High (3) |
| 3 | Input harga manual tanpa default | Kasir | Medium (2) |
| 4 | Tidak ada search di Inventory | Inventory | Medium (2) |
| 5 | Tidak ada kalkulator kembalian | Kasir | Medium (2) |
| 6 | Chart tidak interaktif | Dashboard | Low (1) |

---

## V. SARAN PERBAIKAN

### A. Perbaikan Fungsi-fungsi

#### Priority High

**1. Implementasi Pagination**
**(Lampirkan Mockup: Pagination Controls)**

**Masalah**: Data banyak membuat halaman lambat dan sulit di-navigate.

**Solusi**:
- Tampilkan 20 items per halaman
- Controls: Previous, Next, page numbers
- Info "Showing 1-20 of 150 items"

---

**2. Responsive Sidebar**
**(Lampirkan Mockup: Hamburger Menu Mobile)**

**Masalah**: Sidebar memakan 40% layar mobile.

**Solusi**:
- Hamburger menu (☰) di mobile
- Sidebar muncul sebagai overlay
- Close dengan backdrop atau button X

---

**3. Search di Inventory**
**(Lampirkan Mockup: Search Bar Inventory)**

**Masalah**: Sulit mencari produk spesifik.

**Solusi**:
- Search bar di atas tabel
- Real-time search
- Tampilkan count hasil

---

#### Priority Medium

**4. Default Harga dengan Margin**
**(Lampirkan Mockup: Auto Price Calculator)**

**Masalah**: Kasir input harga manual, rawan error.

**Solusi**:
- Auto-calculate harga dengan margin 30%
- Tampilkan "Harga Beli → Harga Jual (Margin 30%)"
- Input tetap editable
- Warning jika harga < harga beli

---

**5. Kalkulator Kembalian**
**(Lampirkan Mockup: Payment Calculator)**

**Masalah**: Kasir hitung kembalian manual.

**Solusi**:
- Input "Uang Diterima"
- Auto-display "Kembalian"
- Warning jika uang kurang
- Tombol quick amount (Rp50k, Rp100k)

---

### B. Perbaikan Desain Antarmuka

**1. Required Field Indicator**
**(Lampirkan Mockup: Form dengan Asterisk)**

Tambahkan asterisk (*) merah di label required. Contoh: "Nama Produk *"

---

**2. Empty State**
**(Lampirkan Mockup: Empty State)**

Untuk section kosong:
- Icon/ilustrasi relevan
- Teks: "Keranjang masih kosong"
- CTA button

---

**3. Keyboard Shortcuts**

Tambahkan shortcuts:
- ESC: Close modal
- Ctrl+S: Save form
- Ctrl+F: Focus search

---

### C. Implementasi Saran

**Urutan Prioritas**:
1. Pagination (Critical)
2. Responsive Sidebar (Critical)
3. Search Inventory (High)
4. Price Calculator (Medium)
5. Kalkulator Kembalian (Medium)

---

## VI. HASIL DAN DISKUSI

### A. Hasil Analisis

**Overall Usability Score: 7.8/10** (Kategori "Good")

**Breakdown per Metrik**:

| Metrik | Score |
|--------|-------|
| Learnability | 8.5/10 |
| Efficiency | 7.0/10 |
| Memorability | 8.0/10 |
| Errors | 7.5/10 |
| Satisfaction | 8.0/10 |

**Evaluasi Heuristic Nielsen**:

| Prinsip | Score |
|---------|-------|
| H1: Visibility of Status | 8/10 |
| H2: Match Real World | 9/10 |
| H3: User Control | 7/10 |
| H4: Consistency | 9/10 |
| H5: Error Prevention | 8/10 |
| H6: Recognition vs Recall | 8/10 |
| H7: Flexibility | 6/10 |
| H8: Minimalist Design | 8/10 |
| H9: Error Recovery | 8/10 |
| H10: Help & Docs | 5/10 |

---

### B. Diskusi

#### Kekuatan Utama

**Consistency**: Desain sangat konsisten di seluruh sistem (color, typography, spacing, interaction patterns).

**Visual Feedback**: Loading states, toast notifications, dan validation errors memberikan feedback yang baik.

**Modern Design**: Tampilan profesional dengan gradient, shadows, dan smooth animations.

#### Area Improvement

**Scalability**: Tidak ada pagination menyebabkan masalah performa saat data banyak (>100 items).

**Mobile UX**: Sidebar tidak collapse mengurangi 40% ruang layar mobile.

**Efficiency Tools**: Kurang fitur untuk power users (search, bulk actions, shortcuts).

#### Implikasi

**Untuk Pengguna**:
- Training time minimal (learnability tinggi)
- Task repetitif bisa lebih efisien

**Untuk Bisnis**:
- Error reduction = kurangi kerugian
- Efisiensi inventory = hemat waktu
- Laporan comprehensive = better decisions

---

## VII. KESIMPULAN DAN REKOMENDASI

### A. Kesimpulan

1. Sistem memiliki **usability score 7.8/10** (kategori "Good")
2. Kekuatan: Consistency (9/10), Visual Design (8.5/10), Learnability (8.5/10)
3. Kelemahan kritis: Scalability (no pagination), Mobile navigation, Efficiency tools
4. Dari 6 masalah usabilitas, **2 masalah severity HIGH** harus segera diperbaiki
5. Dengan perbaikan, score dapat meningkat menjadi **8.5-9/10**

### B. Rekomendasi

**Prioritas Tinggi** (Harus Diperbaiki):
1. Implementasi pagination di Inventory dan Riwayat Stok
2. Responsive sidebar dengan hamburger menu untuk mobile
3. Search functionality di halaman Inventory

**Prioritas Menengah** (Sebaiknya Diperbaiki):
4. Default harga jual dengan margin calculator di Kasir
5. Kalkulator kembalian untuk mempercepat transaksi

**Prioritas Rendah** (Nice to Have):
6. Keyboard shortcuts untuk power users
7. Interactive dashboard charts
8. Help tooltips untuk field kompleks

---

## LAMPIRAN

### A. Daftar Screenshot/Mockup yang Perlu Dilampirkan

**Current State** (10 screenshot):
1. Halaman Login
2. Dashboard
3. Halaman Kasir
4. Modal Struk Transaksi
5. Halaman Inventory
6. Halaman Varian
7. Riwayat Stok
8. Laporan
9. Color Palette & Typography
10. Desktop vs Mobile (Responsive)

**Mockup Perbaikan** (5 mockup):
11. Pagination controls di tabel
12. Hamburger menu mobile
13. Search bar di Inventory
14. Auto price calculator dengan margin
15. Payment calculator dengan kembalian

---

### B. Referensi

- Nielsen, J. (1994). *Usability Engineering*. Morgan Kaufmann.
- Norman, D. (2013). *The Design of Everyday Things*. Basic Books.
- ISO 9241-11:2018 - *Ergonomics of human-system interaction*

---

### C. Identitas

**Nama**: [Nama Lengkap]
**NIM**: [Nomor Induk Mahasiswa]
**Program Studi**: [Prodi]
**Mata Kuliah**: Interaksi Manusia dan Komputer
**Dosen**: [Nama Dosen]
**Semester**: [Semester/Tahun]
**Tanggal**: [DD/MM/YYYY]

---

*Laporan analisis usabilitas Sistem Manajemen Inventory & Kasir Gudang Amanah Lintang untuk tugas mata kuliah Interaksi Manusia dan Komputer.*
