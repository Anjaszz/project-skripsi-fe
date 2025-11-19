# ANALISIS USABILITAS DAN DESAIN ANTARMUKA
## Sistem Manajemen Inventory & Kasir - Gudang Amanah Lintang

---

## I. PENDAHULUAN

### A. Latar Belakang

Usabilitas dan desain antarmuka merupakan faktor kritis dalam kesuksesan sebuah sistem informasi. Website yang memiliki usabilitas baik akan meningkatkan efisiensi kerja, mengurangi kesalahan pengguna, dan meningkatkan kepuasan pengguna. Dalam konteks sistem manajemen gudang dan kasir, antarmuka yang intuitif sangat penting karena digunakan dalam operasional sehari-hari yang memerlukan kecepatan dan akurasi.

### B. Tujuan Proyek

Tujuan dari analisis ini adalah:
1. Mengevaluasi tingkat usabilitas sistem manajemen Gudang Amanah Lintang
2. Mengidentifikasi kekuatan dan kelemahan desain antarmuka yang ada
3. Memberikan rekomendasi perbaikan berdasarkan prinsip-prinsip HCI (Human-Computer Interaction)
4. Meningkatkan efisiensi dan kepuasan pengguna dalam menggunakan sistem

### C. Ruang Lingkup

Analisis mencakup:
- **Halaman Login**: Autentikasi dan validasi pengguna
- **Dashboard**: Tampilan ringkasan dan visualisasi data
- **Halaman Kasir**: Sistem Point of Sale (POS)
- **Manajemen Inventory**: Pengelolaan produk dan stok
- **Manajemen Varian**: Pengelolaan variasi produk
- **Riwayat Stok**: Audit trail stok masuk
- **Laporan**: Generasi laporan penjualan, stok, dan transaksi

### D. Metodologi

Metode yang digunakan:
1. **Heuristic Evaluation**: Evaluasi berdasarkan 10 prinsip usabilitas Nielsen
2. **Cognitive Walkthrough**: Simulasi tugas pengguna
3. **Interface Analysis**: Analisis visual dan interaksi
4. **User Scenario Testing**: Pengujian skenario penggunaan nyata

---

## II. STUDI PENDAHULUAN

### A. Deskripsi Website/Aplikasi

**Nama**: Sistem Manajemen Inventory & Kasir - Gudang Amanah Lintang

**Tujuan**:
Sistem berbasis web untuk mengelola inventory air mineral dan melakukan transaksi penjualan di gudang distributor.

**Fitur Utama**:
1. Autentikasi berbasis role (Admin & Kasir)
2. Dashboard dengan visualisasi data real-time
3. Point of Sale (POS) untuk transaksi penjualan
4. Manajemen inventory dan stok
5. Manajemen varian produk
6. Riwayat pergerakan stok
7. Laporan penjualan, stok, dan transaksi dengan export Excel/PDF

**Target Pengguna**:
- **Admin Gudang**: Mengelola inventory, melihat laporan, monitoring operasional
- **Kasir**: Melakukan transaksi penjualan harian

### B. Teori Usabilitas

**Definisi Usabilitas (ISO 9241-11)**:
"Tingkat kemampuan suatu produk untuk digunakan oleh pengguna tertentu dalam mencapai tujuan tertentu dengan efektivitas, efisiensi, dan kepuasan dalam konteks penggunaan tertentu."

**10 Heuristic Principles (Jakob Nielsen)**:
1. **Visibility of system status**: Sistem harus selalu menginformasikan pengguna tentang apa yang sedang terjadi
2. **Match between system and real world**: Sistem harus menggunakan bahasa dan konsep yang familiar bagi pengguna
3. **User control and freedom**: Pengguna harus memiliki kontrol penuh dan dapat membatalkan aksi dengan mudah
4. **Consistency and standards**: Elemen dan interaksi harus konsisten di seluruh sistem
5. **Error prevention**: Desain harus mencegah kesalahan sebelum terjadi
6. **Recognition rather than recall**: Mengurangi beban memori pengguna dengan membuat objek dan aksi visible
7. **Flexibility and efficiency of use**: Sistem harus efisien untuk pengguna pemula maupun expert
8. **Aesthetic and minimalist design**: Interface tidak boleh mengandung informasi yang tidak relevan
9. **Help users recognize, diagnose, and recover from errors**: Pesan error harus jelas dan konstruktif
10. **Help and documentation**: Menyediakan bantuan dan dokumentasi yang mudah diakses

**Metrik Usabilitas**:
- **Learnability**: Kemudahan pengguna baru mempelajari sistem
- **Efficiency**: Kecepatan penyelesaian tugas setelah pengguna familiar dengan sistem
- **Memorability**: Kemudahan mengingat cara penggunaan setelah tidak digunakan beberapa waktu
- **Errors**: Frekuensi dan severity kesalahan yang dilakukan pengguna
- **Satisfaction**: Kepuasan subjektif pengguna terhadap sistem

### C. Prinsip Dasar Antarmuka

**1. Gestalt Principles**:
- **Proximity (Kedekatan)**: Elemen yang berdekatan dipersepsikan sebagai kelompok
- **Similarity (Kemiripan)**: Elemen yang mirip dipersepsikan memiliki fungsi yang sama
- **Continuity (Kontinuitas)**: Mata mengikuti garis dan kurva yang berkelanjutan
- **Closure (Penutupan)**: Pengguna melengkapi pola visual yang tidak lengkap

**2. Fitts' Law**:
Waktu untuk mencapai target UI berbanding lurus dengan jarak dan berbanding terbalik dengan ukuran target. Implikasi: tombol penting harus besar dan mudah dijangkau.

**3. Hick's Law**:
Waktu keputusan meningkat logaritmik dengan jumlah pilihan. Implikasi: kurangi jumlah pilihan untuk mempercepat keputusan.

**4. Design Principles**:
- **Hierarchy (Hierarki)**: Struktur visual yang jelas menunjukkan tingkat kepentingan
- **Consistency (Konsistensi)**: Elemen serupa berperilaku sama di seluruh sistem
- **Feedback (Umpan Balik)**: Sistem memberikan respons terhadap setiap aksi pengguna
- **Affordance**: Petunjuk visual tentang cara penggunaan elemen

---

## III. METODE PENELITIAN

### A. Metode Pengumpulan Data

**1. Heuristic Evaluation**
Evaluasi sistematis berdasarkan 10 prinsip usabilitas Nielsen. Setiap halaman dievaluasi dan diberikan severity rating:
- **0**: Tidak ada masalah usability
- **1**: Cosmetic problem (prioritas rendah)
- **2**: Minor usability problem (prioritas menengah)
- **3**: Major usability problem (prioritas tinggi)
- **4**: Usability catastrophe (harus segera diperbaiki)

**2. Cognitive Walkthrough**
Simulasi skenario tugas pengguna untuk mengidentifikasi hambatan dalam menyelesaikan tugas. Skenario yang diuji:
- **Skenario 1**: Kasir melakukan transaksi penjualan dari login hingga cetak struk
- **Skenario 2**: Admin menambahkan stok produk baru
- **Skenario 3**: Admin melihat dan mengekspor laporan penjualan bulanan

**3. Interface Analysis**
Analisis mendalam terhadap:
- Desain visual (warna, tipografi, spacing, layout)
- Elemen interaktif (tombol, form, menu, modal)
- Feedback system (notifikasi, loading states, validasi)
- Responsivitas terhadap berbagai ukuran layar

### B. Instrumen Penelitian

**Tools yang Digunakan**:
1. **Checklist Heuristic Evaluation**: Formulir penilaian berdasarkan 10 prinsip Nielsen
2. **Task Scenario Cards**: Kartu berisi deskripsi tugas untuk cognitive walkthrough
3. **Screenshot Documentation**: Dokumentasi visual untuk setiap halaman dan interaksi
4. **Severity Rating Matrix**: Tabel untuk menilai tingkat keparahan masalah usability

### C. Prosedur Penelitian

**Tahap 1: Persiapan** (Minggu 1)
- Setup dan instalasi sistem
- Pembuatan user scenario dan task cards
- Persiapan checklist dan formulir evaluasi

**Tahap 2: Pengumpulan Data** (Minggu 2)
- Heuristic evaluation untuk setiap halaman
- Cognitive walkthrough untuk setiap task scenario
- Dokumentasi screenshot dan findings

**Tahap 3: Analisis Data** (Minggu 3)
- Kompilasi temuan dari evaluasi
- Penilaian severity untuk setiap masalah
- Identifikasi pola dan tema umum

**Tahap 4: Rekomendasi** (Minggu 4)
- Prioritasi perbaikan berdasarkan severity
- Pembuatan mockup solusi perbaikan
- Dokumentasi laporan akhir

---

## IV. ANALISIS USABILITAS

### A. Tingkat Usabilitas Per Fungsi

#### 1. Halaman Login

**(Lampirkan Screenshot: Halaman Login)**

**Kekuatan**:
- Tampilan modern dengan gradient background yang menarik
- Validasi real-time untuk username (minimal 3 karakter) dan password (minimal 6 karakter)
- Pesan error yang jelas dan spesifik ("Username minimal 3 karakter")
- Animasi shake pada error memberikan feedback visual yang kuat
- Tombol show/hide password meningkatkan kontrol pengguna
- Loading indicator saat proses login berlangsung
- Auto-redirect berdasarkan role pengguna

**Kelemahan**:
- Tidak ada fitur "Remember Me" - pengguna harus login berulang kali
- Tidak ada fitur "Forgot Password" - tidak ada mekanisme recovery
- Tidak ada warning untuk Caps Lock aktif - bisa menyebabkan kesalahan input password
- Field password tidak memberikan hint tentang kriteria password yang dibutuhkan

**Score Usabilitas**: 8.0/10

---

#### 2. Dashboard

**(Lampirkan Screenshot: Halaman Dashboard dengan 4 Card Metrics dan Chart)**

**Kekuatan**:
- Information architecture yang jelas dengan 4 card metrics di atas
- Visualisasi data dengan bar chart penjualan vs keuntungan
- Warna yang konsisten untuk setiap jenis informasi (biru=penjualan, hijau=keuntungan, merah=alert)
- Format mata uang Rupiah yang konsisten dan mudah dibaca
- Grid layout responsif yang rapi
- Penggunaan icon yang relevan dan membantu pemahaman

**Kelemahan**:
- Tidak ada tombol refresh manual - pengguna harus reload halaman
- Chart tidak interaktif - tidak bisa klik untuk melihat detail
- Tidak ada filter periode waktu - selalu menampilkan 7 hari terakhir
- Data stok hampir habis tidak bisa diklik untuk melihat produk mana saja

**Score Usabilitas**: 8.5/10

---

#### 3. Halaman Kasir (Point of Sale)

**(Lampirkan Screenshot: Layout 2 Kolom - Daftar Produk & Keranjang)**

**Kekuatan**:
- Layout 2 kolom yang jelas: produk di kiri, keranjang di kanan
- Search bar untuk mencari produk dengan cepat
- Stok produk ditampilkan dengan jelas pada setiap card produk
- Tombol "Tambah ke Keranjang" disabled otomatis jika stok habis
- Validasi real-time untuk quantity dan harga jual
- Highlight merah pada input yang invalid (qty > stok atau harga negatif)
- Kalkulasi total otomatis saat ada perubahan
- Modal struk transaksi yang informatif dan profesional
- Fitur cetak invoice dengan format yang rapi

**Kelemahan**:
- Input harga jual manual rawan kesalahan - tidak ada harga default yang terlihat
- Tidak ada tombol quantity selector cepat (harus add to cart dulu baru ubah qty)
- Tidak ada input metode pembayaran (cash/transfer)
- Tidak ada kalkulator kembalian - kasir harus hitung manual
- Tidak ada history transaksi hari ini yang bisa diakses cepat
- Tidak ada integrasi barcode scanner

**Score Usabilitas**: 7.5/10

---

#### 4. Manajemen Inventory

**(Lampirkan Screenshot: Tabel Inventory dengan Tombol Tambah Stok)**

**Kekuatan**:
- Tabel yang rapi dengan informasi lengkap (nama, varian, stok, harga, total nilai)
- Badge merah untuk stok < 10 memberikan visual alert yang jelas
- Modal form yang tidak mengganggu (tidak pindah halaman)
- Konfirmasi sebelum menghapus produk mencegah kesalahan fatal
- Tombol aksi (Edit, Delete) dengan icon yang jelas
- Kalkulasi total nilai stok otomatis

**Kelemahan**:
- Tidak ada search/filter produk - sulit mencari produk spesifik jika data banyak
- Tidak ada pagination - semua data ditampilkan sekaligus (masalah performa)
- Tidak ada bulk actions - tidak bisa delete/edit beberapa produk sekaligus
- Tidak ada kolom gambar produk - hanya mengandalkan teks
- Tidak ada sort by kolom (nama, stok, harga)

**Score Usabilitas**: 7.0/10

---

#### 5. Manajemen Varian

**(Lampirkan Screenshot: Tabel Varian dengan Toggle Status)**

**Kekuatan**:
- Tabel sederhana dan mudah dipahami
- Toggle active/inactive dengan visual yang jelas (badge hijau/abu-abu)
- Filter untuk menampilkan/menyembunyikan varian tidak aktif
- Pesan error informatif jika hapus varian yang masih digunakan produk

**Kelemahan**:
- Tidak ada preview produk yang menggunakan varian tersebut
- Tidak ada sort atau search

**Score Usabilitas**: 7.5/10

---

#### 6. Riwayat Stok

**(Lampirkan Screenshot: Filter Section + Tabel History dengan Summary Cards)**

**Kekuatan**:
- Filter yang lengkap: search text, filter produk, filter varian, date range
- Visual indicator untuk filter yang aktif (badge biru)
- Summary cards menampilkan total entries, quantity, dan nilai pembelian
- Tombol reset filter untuk kembali ke tampilan semua data
- Export ke Excel dan PDF dengan filter yang sama

**Kelemahan**:
- Tidak ada pagination - masalah performa jika data sangat banyak
- Tidak bisa edit atau delete entry yang salah (tidak ada koreksi)
- Filter dropdown bisa lebih user-friendly dengan checkbox multiple select

**Score Usabilitas**: 8.0/10

---

#### 7. Laporan

**(Lampirkan Screenshot: Tab Navigation untuk 3 Jenis Laporan)**

**Kekuatan**:
- Tab navigation yang jelas untuk 3 jenis laporan (Penjualan, Stok, Transaksi)
- Filter date range untuk setiap jenis laporan
- Data komprehensif dan terstruktur dengan baik
- Export ke Excel dan PDF untuk setiap jenis laporan
- Summary metrics di bagian atas setiap laporan

**Kelemahan**:
- Tidak ada preview sebelum export - pengguna tidak tahu format hasilnya
- Tidak ada visualisasi chart - hanya tabel
- Tidak ada custom column selection - tidak bisa pilih kolom mana yang di-export
- Date picker bisa lebih intuitif dengan preset (This Month, Last Month, dll)

**Score Usabilitas**: 7.5/10

---

### B. Desain Antarmuka

#### 1. Visual Design

**Color Palette**:
**(Lampirkan Screenshot: Color Palette yang Digunakan)**

Sistem menggunakan color scheme yang konsisten:
- **Primary (Blue)**: Untuk aksi utama, link, dan elemen interaktif
- **Success (Green)**: Untuk notifikasi sukses dan data positif
- **Warning (Yellow)**: Untuk alert dan peringatan
- **Danger (Red)**: Untuk error, delete action, dan stock alert
- **Neutral (Gray)**: Untuk teks, border, dan background

**Evaluasi**: Kontras warna sudah baik dan accessible. Penggunaan warna konsisten di seluruh sistem membantu pengguna memahami makna setiap warna.

**Typography**:
- Heading: Bold weight dengan ukuran hierarkis (h1: 3xl, h2: xl)
- Body text: Regular weight dengan ukuran 14-16px
- Small text: 12px untuk caption dan metadata

**Evaluasi**: Hierarki tipografi jelas, font size cukup besar untuk dibaca, line-height nyaman.

**Spacing & Layout**:
- Konsisten menggunakan spacing scale (4px, 8px, 16px, 24px)
- Padding dan margin proporsional
- Whitespace cukup sehingga tidak cramped

**Evaluasi**: Layout bersih, tidak terlalu padat, memudahkan scanning informasi.

---

#### 2. Elemen Interaktif

**Buttons**:
**(Lampirkan Screenshot: Berbagai State Button - Normal, Hover, Disabled, Loading)**

- Hover state: Perubahan warna yang jelas saat cursor di atas button
- Disabled state: Opacity berkurang dan cursor not-allowed
- Loading state: Spinner animation dengan teks "Memproses..."
- Icon + Text: Kombinasi yang memperjelas fungsi button

**Evaluasi**: Button states sudah lengkap dan memberikan feedback visual yang baik. Size button cukup besar (sesuai Fitts' Law).

**Forms & Input Fields**:
**(Lampirkan Screenshot: Form dengan Validasi Error)**

- Validasi real-time dengan border merah untuk field error
- Error message di bawah field yang spesifik dan membantu
- Label yang jelas untuk setiap field
- Placeholder text yang deskriptif

**Kelemahan**:
- Tidak ada inline help atau tooltip untuk field yang kompleks
- Required field tidak ada indicator asterisk (*)

**Modal Dialogs**:
**(Lampirkan Screenshot: Confirmation Modal)**

- Dark backdrop untuk fokus perhatian
- Animasi smooth saat muncul/hilang
- Tombol close di pojok kanan atas
- Color-coded berdasarkan jenis (warning=yellow, danger=red)

**Kelemahan**:
- Tidak bisa close dengan tombol ESC keyboard
- Click di luar modal tidak menutup modal (inconsistent behavior)

**Notifications (Toast)**:
**(Lampirkan Screenshot: Toast Success dan Toast Error)**

- Muncul di pojok kanan atas
- Color-coded berdasarkan tipe (success, error, warning, info)
- Auto-dismiss setelah 3 detik
- Manual close dengan tombol X
- Slide-in animation yang smooth

**Evaluasi**: Toast notification system sudah sangat baik dan tidak mengganggu workflow.

---

#### 3. Responsiveness

**(Lampirkan Screenshot: Tampilan Desktop vs Mobile untuk Halaman Dashboard dan Kasir)**

**Desktop (>1024px)**:
- Layout multi-column memanfaatkan lebar layar dengan baik
- Sidebar tetap visible di sisi kiri
- Dashboard cards dalam grid 4 kolom

**Tablet (640px - 1024px)**:
- Dashboard cards menjadi 2 kolom
- Kasir layout tetap 2 kolom tapi dengan proporsi berbeda
- Tabel scrollable horizontal

**Mobile (<640px)**:
- Dashboard cards stack vertikal (1 kolom)
- Kasir layout menjadi 1 kolom (produk di atas, keranjang di bawah)
- Sidebar **tetap visible** dan tidak ada hamburger menu

**Evaluasi**:
✅ Responsive design sudah diimplementasi dengan baik untuk konten
⚠️ **Critical Issue**: Sidebar tidak collapse di mobile, memakan space yang berharga

---

### C. Temuan Utama

#### Kekuatan Sistem

| Aspek | Score | Deskripsi |
|-------|-------|-----------|
| **Consistency** | 9/10 | Design pattern konsisten di seluruh halaman |
| **Visual Feedback** | 8.5/10 | Loading states, validasi, dan notifikasi yang baik |
| **Error Prevention** | 8/10 | Validasi real-time dan confirmation dialogs |
| **Visual Design** | 8.5/10 | Modern, profesional, color scheme yang tepat |
| **Information Architecture** | 8/10 | Struktur navigasi jelas dan logis |

#### Masalah Usabilitas yang Ditemukan

| No | Masalah | Lokasi | Severity | Prinsip Nielsen yang Dilanggar |
|----|---------|--------|----------|--------------------------------|
| 1 | Tidak ada pagination | Inventory, Stock History | High (3) | H8: Aesthetic & Minimalist Design |
| 2 | Sidebar tidak collapse di mobile | Semua halaman | High (3) | H7: Flexibility & Efficiency |
| 3 | Manual price input tanpa default | Kasir | Medium (2) | H5: Error Prevention |
| 4 | Tidak ada search di Inventory | Inventory | Medium (2) | H7: Flexibility & Efficiency |
| 5 | Tidak ada kalkulator kembalian | Kasir | Medium (2) | H7: Flexibility & Efficiency |
| 6 | Tidak ada forgot password | Login | Low (1) | H9: Error Recovery |
| 7 | Chart tidak interaktif | Dashboard | Low (1) | H7: Flexibility & Efficiency |
| 8 | Tidak ada help/tooltip | Semua form | Medium (2) | H10: Help & Documentation |
| 9 | Modal tidak bisa close dengan ESC | Semua modal | Low (1) | H3: User Control & Freedom |
| 10 | Tidak ada sort di tabel | Inventory, Variants | Low (1) | H7: Flexibility & Efficiency |

---

## V. SARAN PERBAIKAN

### A. Perbaikan Fungsi-fungsi

#### Priority 1 (High) - Harus Segera Diperbaiki

**1. Implementasi Pagination di Inventory dan Stock History**

**(Lampirkan Mockup: Tabel dengan Pagination Controls di Bawah)**

**Masalah**:
Semua data ditampilkan sekaligus menyebabkan masalah performa dan sulit di-scan jika data >50 items.

**Solusi**:
- Tambahkan pagination controls di bawah tabel
- Tampilkan 20 items per halaman (default)
- Berikan opsi untuk mengubah items per page (10, 20, 50, 100)
- Tampilkan info "Showing 1-20 of 150 items"
- Tombol Previous, Next, dan page numbers

**Expected Impact**: Meningkatkan performa loading dan memudahkan navigasi data.

---

**2. Responsive Sidebar dengan Hamburger Menu**

**(Lampirkan Mockup: Mobile Layout dengan Hamburger Menu dan Collapsible Sidebar)**

**Masalah**:
Sidebar tetap visible di mobile, memakan 30-40% lebar layar yang seharusnya digunakan untuk konten.

**Solusi**:
- Tambahkan hamburger menu icon (☰) di pojok kiri atas untuk mobile
- Sidebar muncul sebagai overlay saat hamburger diklik
- Sidebar bisa di-close dengan click backdrop atau tombol X
- Transisi smooth dengan slide animation

**Expected Impact**: Maksimalkan ruang layar mobile untuk konten utama.

---

**3. Search & Filter di Halaman Inventory**

**(Lampirkan Mockup: Search Bar di Atas Tabel Inventory)**

**Masalah**:
Tidak ada cara cepat untuk mencari produk spesifik, harus scroll manual.

**Solusi**:
- Tambahkan search bar di atas tabel (mirip seperti di Kasir)
- Search real-time berdasarkan nama produk atau varian
- Tampilkan hasil count "Ditemukan 5 produk dari 150"
- Tombol clear (X) untuk reset search

**Expected Impact**: Menghemat waktu pencarian produk, terutama jika data banyak.

---

#### Priority 2 (Medium) - Sebaiknya Diperbaiki

**4. Default Harga Jual dengan Margin di Kasir**

**(Lampirkan Mockup: Cart Item dengan Default Price dan Label "Margin 30%")**

**Masalah**:
Kasir harus input harga jual manual untuk setiap item, rawan kesalahan dan tidak efisien.

**Solusi**:
- Auto-calculate harga jual dengan margin default 30%
- Tampilkan label "Harga Beli: Rp10.000 → Harga Jual (Margin 30%): Rp13.000"
- Input tetap editable jika kasir ingin mengubah harga
- Highlight jika harga jual lebih rendah dari harga beli (warning)

**Expected Impact**: Mengurangi kesalahan input harga dan mempercepat transaksi.

---

**5. Kalkulator Kembalian di Kasir**

**(Lampirkan Mockup: Section "Pembayaran" dengan Input Uang Diterima dan Display Kembalian)**

**Masalah**:
Kasir harus menghitung kembalian manual, memperlambat transaksi.

**Solusi**:
Tambahkan section "Pembayaran" sebelum checkout:
- Input "Uang Diterima" dengan format Rupiah
- Auto-calculate dan display "Kembalian" dengan font besar
- Tampilkan warning jika uang diterima kurang dari total
- Tombol quick amount (Rp50.000, Rp100.000, Pas)

**Expected Impact**: Mempercepat transaksi dan mengurangi kesalahan perhitungan.

---

**6. Bulk Actions di Inventory**

**(Lampirkan Mockup: Checkbox di Setiap Row + Toolbar Bulk Actions)**

**Masalah**:
Tidak efisien jika ingin delete atau update beberapa produk sekaligus.

**Solusi**:
- Tambahkan checkbox di kolom pertama setiap row
- Checkbox "Select All" di header
- Toolbar muncul saat ada item terpilih: "2 items selected"
- Tombol bulk actions: Delete, Export, Update Status

**Expected Impact**: Meningkatkan efisiensi operasional admin.

---

**7. Quick Add Quantity di Kasir**

**(Lampirkan Mockup: Product Card dengan Quantity Selector Sebelum Add to Cart)**

**Masalah**:
Harus add to cart dulu baru bisa set quantity, tidak efisien untuk qty > 1.

**Solusi**:
- Tambahkan quantity selector di product card
- Tombol (-) dan (+) untuk increment/decrement
- Input number manual jika perlu
- Tombol "Add to Cart" menggunakan qty yang sudah diset

**Expected Impact**: Mempercepat proses add multiple items.

---

#### Priority 3 (Low) - Nice to Have

**8. Fitur Forgot Password**

**(Lampirkan Mockup: Link "Lupa Password?" dan Halaman Reset Password)**

**Solusi**:
- Link "Lupa Password?" di bawah form login
- Halaman reset dengan input email/username
- Sistem kirim link reset ke email (perlu backend support)

---

**9. Interactive Chart di Dashboard**

**(Lampirkan Mockup: Tooltip Hover dan Click untuk Detail)**

**Solusi**:
- Hover pada bar chart menampilkan detail nilai
- Click pada bar membuka modal dengan breakdown transaksi hari itu

---

**10. Help System dengan Tooltips**

**(Lampirkan Mockup: Icon "?" dengan Tooltip Hover)**

**Solusi**:
- Icon "?" di samping label field yang kompleks
- Hover menampilkan tooltip dengan hint/contoh
- Link ke halaman Help/FAQ di sidebar

---

### B. Perbaikan Desain Antarmuka

#### Visual Design Improvements

**1. Required Field Indicator**

**(Lampirkan Mockup: Form dengan Asterisk Merah di Label Required)**

Tambahkan asterisk (*) merah di setiap label field yang required. Contoh: "Nama Produk *"

---

**2. Empty State Illustrations**

**(Lampirkan Mockup: Empty State dengan Icon dan CTA Button)**

Untuk halaman/section yang kosong (misal: keranjang kosong, tidak ada transaksi), tampilkan:
- Icon/ilustrasi yang relevan
- Teks deskriptif: "Keranjang Anda masih kosong"
- CTA button: "Mulai Belanja"

---

**3. Loading Skeleton**

**(Lampirkan Mockup: Skeleton Loader untuk Cards dan Tabel)**

Ganti spinner dengan skeleton loader (placeholder animation) untuk better perceived performance.

---

#### Interaction Improvements

**4. Keyboard Shortcuts**

**(Lampirkan Tabel: Daftar Keyboard Shortcuts)**

Tambahkan keyboard shortcuts untuk power users:
- ESC: Close modal/dialog
- Ctrl+S: Save form
- Ctrl+F: Focus search bar
- F2: Quick add product (di Kasir)

Tampilkan hint keyboard shortcut di tooltip button.

---

**5. Confirmation Dialog dengan Preview**

**(Lampirkan Mockup: Confirmation Dialog Delete dengan Preview Item yang Akan Dihapus)**

Saat delete, tampilkan preview item yang akan dihapus di confirmation dialog untuk double-check.

---

**6. Progress Indicator untuk Multi-step Form**

**(Lampirkan Mockup: Progress Bar untuk Form Tambah Produk)**

Jika form memiliki banyak field, bagi menjadi steps dengan progress indicator (Step 1/3).

---

### C. Implementasi Saran

#### Roadmap Implementasi

**Fase 1: Critical Fixes** (Minggu 1-2)
- ✅ Pagination di Inventory & Stock History
- ✅ Responsive sidebar dengan hamburger menu
- ✅ Search functionality di Inventory
- ✅ Required field indicators

**Fase 2: Efficiency Enhancements** (Minggu 3-4)
- ✅ Default harga jual dengan margin calculator di Kasir
- ✅ Kalkulator kembalian
- ✅ Bulk actions di Inventory
- ✅ Empty states dan loading skeletons

**Fase 3: User Experience Polish** (Minggu 5-6)
- ✅ Quick add quantity di Kasir
- ✅ Keyboard shortcuts
- ✅ Interactive charts
- ✅ Help tooltips

**Fase 4: Testing & Validation** (Minggu 7)
- User Acceptance Testing (UAT) dengan admin dan kasir asli
- Usability testing dengan task scenarios
- Collect feedback dan iterate

---

## VI. HASIL DAN DISKUSI

### A. Hasil Analisis

**Overall Usability Score: 7.8/10**

Sistem memiliki usability yang **baik** dengan foundation yang solid, namun masih ada ruang untuk improvement terutama di aspek efficiency dan flexibility.

**Breakdown per Metrik Usabilitas**:

| Metrik | Score | Evaluasi |
|--------|-------|----------|
| **Learnability** | 8.5/10 | Interface intuitif dengan navigasi yang jelas. Pengguna baru dapat dengan cepat memahami struktur dan fungsi sistem. |
| **Efficiency** | 7.0/10 | Beberapa task bisa lebih cepat dengan fitur seperti search, pagination, dan keyboard shortcuts. |
| **Memorability** | 8.0/10 | Desain konsisten membuat sistem mudah diingat. Pengguna yang kembali setelah lama tidak akan kesulitan. |
| **Errors** | 7.5/10 | Sudah ada error prevention yang baik, tapi masih ada area yang rawan kesalahan (manual price input). |
| **Satisfaction** | 8.0/10 | Desain modern dan feedback yang responsif meningkatkan kepuasan pengguna. |

**Evaluasi per Prinsip Heuristic Nielsen**:

| Heuristic Principle | Score | Komentar |
|---------------------|-------|----------|
| H1: Visibility of System Status | 8/10 | Loading states dan toast notifications sudah baik |
| H2: Match System & Real World | 9/10 | Bahasa Indonesia dan terminologi yang familiar |
| H3: User Control & Freedom | 7/10 | Perlu tambahan undo/redo dan keyboard shortcuts |
| H4: Consistency & Standards | 9/10 | Design patterns sangat konsisten |
| H5: Error Prevention | 8/10 | Validasi real-time baik, perlu price safeguards |
| H6: Recognition vs Recall | 8/10 | Label jelas, icon membantu, perlu tooltips |
| H7: Flexibility & Efficiency | 6/10 | Kurang shortcuts, bulk actions, pagination |
| H8: Aesthetic & Minimalist | 8/10 | Desain clean, bisa lebih baik dengan pagination |
| H9: Error Recovery | 8/10 | Error messages jelas dan konstruktif |
| H10: Help & Documentation | 5/10 | Tidak ada help docs atau inline help |

---

### B. Diskusi

#### 1. Kekuatan Utama Sistem

**Consistency yang Excellent**
Sistem memiliki konsistensi yang sangat baik di seluruh halaman. Color scheme, typography, spacing, dan interaction patterns uniform. Ini sangat membantu learnability dan memorability.

**Visual Feedback yang Responsif**
Setiap aksi pengguna mendapat feedback visual yang jelas: loading states, toast notifications, validation errors dengan highlight. Ini meningkatkan confidence pengguna.

**Modern & Professional Design**
Desain visual modern dengan penggunaan gradient, shadows, dan smooth animations. Tidak terlihat seperti sistem lama atau amatir.

---

#### 2. Area yang Perlu Improvement

**Scalability Issues**
Masalah paling kritis adalah ketiadaan pagination. Saat data bertambah (>100 produk atau transaksi), sistem akan lambat dan sulit digunakan. Ini technical debt yang harus segera diselesaikan.

**Mobile Experience**
Meskipun responsive design sudah diimplementasi, navigation di mobile masih bermasalah. Sidebar yang tidak collapse mengurangi usable screen space hingga 40%.

**Efficiency Tools**
Power users (admin yang menggunakan sistem setiap hari) akan merasakan friction karena kurangnya efficiency tools: search, bulk actions, keyboard shortcuts, quick filters.

**Help & Onboarding**
Tidak ada help system atau onboarding untuk pengguna baru. Meskipun interface intuitif, beberapa fitur kompleks (seperti input harga jual di kasir) butuh penjelasan.

---

#### 3. Implikasi untuk Stakeholders

**Untuk Pengguna (Admin & Kasir)**:
- ✅ Learnability tinggi = training time minimal
- ⚠️ Beberapa task repetitif bisa lebih efisien
- ⚠️ Mobile usage perlu improvement untuk fleksibilitas

**Untuk Bisnis (Gudang Amanah Lintang)**:
- ✅ Error reduction di kasir = mengurangi kerugian
- ✅ Efisiensi inventory management = menghemat waktu staf
- ✅ Laporan comprehensive = better decision making
- ⚠️ Scalability issues bisa jadi bottleneck saat bisnis berkembang

**Untuk Development Team**:
- ✅ Code structure baik = mudah maintenance
- ✅ Component reusability tinggi = faster development
- ⚠️ Perlu optimization untuk performa long-term

---

#### 4. Perbandingan dengan Best Practices

**Yang Sudah Sesuai Best Practices**:
- ✅ Mobile-first responsive design
- ✅ Real-time form validation
- ✅ Confirmation dialogs untuk destructive actions
- ✅ Toast notifications untuk feedback
- ✅ Loading states untuk async operations

**Yang Belum Sesuai Best Practices**:
- ⚠️ Pagination untuk large datasets
- ⚠️ Keyboard navigation dan shortcuts
- ⚠️ Accessibility features (screen reader support)
- ⚠️ Empty states dengan illustrations
- ⚠️ Help documentation

---

## VII. KESIMPULAN DAN REKOMENDASI

### A. Kesimpulan

**1. Tingkat Usabilitas Overall**

Sistem Manajemen Inventory & Kasir Gudang Amanah Lintang memiliki **usability score 7.8/10**, yang termasuk kategori **"Good - Above Average"**. Sistem ini layak digunakan untuk operasional sehari-hari dengan catatan beberapa perbaikan prioritas tinggi harus segera diimplementasi.

**2. Kekuatan Utama**

- **Consistency & Standards** (9/10): Desain sangat konsisten di seluruh sistem
- **Visual Design** (8.5/10): Modern, profesional, color scheme yang tepat
- **Error Prevention** (8/10): Validasi real-time dan confirmation dialogs
- **Learnability** (8.5/10): Interface intuitif untuk pengguna baru

**3. Kelemahan Kritis**

- **Scalability** (Severity: High): Tidak ada pagination untuk data banyak
- **Mobile Navigation** (Severity: High): Sidebar tidak responsive
- **Efficiency Tools** (Severity: Medium): Kurang search, bulk actions, shortcuts
- **Help System** (Severity: Medium): Tidak ada inline help atau dokumentasi

**4. Rekomendasi Prioritas**

Dari 10 masalah usabilitas yang ditemukan, **3 masalah severity HIGH harus segera diperbaiki** dalam 2 minggu pertama. Perbaikan ini akan memberikan impact terbesar terhadap user experience dan scalability sistem.

**5. Overall Assessment**

Sistem memiliki **foundation yang solid** dengan design principles yang baik. Dengan implementasi perbaikan yang disarankan, usability score dapat meningkat menjadi **8.5-9/10**, menjadikannya sistem yang **excellent** untuk digunakan jangka panjang.

---

### B. Rekomendasi

#### Rekomendasi Jangka Pendek (1-2 Bulan)

**IMMEDIATE ACTIONS** (Week 1-2):

1. **Implementasi Pagination**
   - Lokasi: Inventory, Stock History, Laporan
   - Impact: ⭐⭐⭐⭐⭐ (Critical untuk scalability)
   - *Lampirkan mockup: Pagination controls*

2. **Responsive Sidebar Navigation**
   - Lokasi: Layout & Sidebar component
   - Impact: ⭐⭐⭐⭐⭐ (Critical untuk mobile UX)
   - *Lampirkan mockup: Hamburger menu mobile*

3. **Search Functionality di Inventory**
   - Lokasi: Inventory page
   - Impact: ⭐⭐⭐⭐ (High untuk efficiency)
   - *Lampirkan mockup: Search bar di inventory*

**ENHANCEMENTS** (Week 3-4):

4. **Price Calculator di Kasir**
   - Impact: ⭐⭐⭐⭐ (Mengurangi error, mempercepat transaksi)
   - *Lampirkan mockup: Auto-calculated price dengan margin*

5. **Kalkulator Kembalian**
   - Impact: ⭐⭐⭐⭐ (Mempercepat transaksi)
   - *Lampirkan mockup: Section pembayaran dengan kembalian*

6. **Bulk Actions di Inventory**
   - Impact: ⭐⭐⭐ (Meningkatkan efficiency admin)
   - *Lampirkan mockup: Checkbox selection dan bulk toolbar*

---

#### Rekomendasi Jangka Menengah (3-6 Bulan)

**USABILITY POLISH**:

7. **Keyboard Shortcuts System**
   - Tambahkan shortcuts untuk power users
   - Impact: ⭐⭐⭐ (Efficiency untuk frequent users)

8. **Help & Documentation**
   - Inline help tooltips untuk field kompleks
   - Halaman Help/FAQ
   - Impact: ⭐⭐⭐ (Mengurangi learning curve)

9. **Interactive Dashboard Charts**
   - Chart bisa di-hover dan click untuk detail
   - Impact: ⭐⭐ (Enhanced data exploration)

10. **Forgot Password Flow**
    - Recovery mechanism untuk reset password
    - Impact: ⭐⭐ (User autonomy)

---

#### Rekomendasi Jangka Panjang (6-12 Bulan)

**ADVANCED FEATURES**:

11. **Barcode Scanner Integration**
    - Untuk Kasir page
    - Impact: ⭐⭐⭐⭐ (Signifikan mempercepat transaksi)

12. **Product Images**
    - Upload dan display foto produk
    - Impact: ⭐⭐⭐ (Visual recognition lebih baik dari text)

13. **Advanced Analytics Dashboard**
    - Predictive analytics untuk stok
    - Sales trends dan forecasting
    - Impact: ⭐⭐⭐ (Better business insights)

14. **Multi-language Support**
    - Jika akan ekspansi regional
    - Impact: ⭐⭐ (Tergantung bisnis needs)

---

#### Rekomendasi untuk Testing & Validation

**CONTINUOUS IMPROVEMENT**:

1. **User Acceptance Testing (UAT)**
   - Testing dengan actual users (admin & kasir)
   - Collect quantitative data (task completion time, error rate)
   - Iterate berdasarkan feedback real users

2. **Usability Testing Sessions**
   - Observe users melakukan task scenarios
   - Identify pain points yang tidak terdeteksi di heuristic evaluation
   - Test sebelum dan sesudah perbaikan untuk measure improvement

3. **Analytics Implementation**
   - Tracking user behavior (which features most used, where users stuck)
   - Monitor page load times
   - A/B testing untuk UI changes

4. **Accessibility Audit**
   - Ensure WCAG 2.1 Level AA compliance
   - Screen reader compatibility testing
   - Keyboard navigation completeness
   - Color contrast validation

---

#### Success Metrics untuk Measure Improvement

**Pre vs Post Implementation Comparison**:

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| Task Completion Time | Baseline | -20% | Timed user testing |
| Error Rate | Baseline | -50% | Error tracking |
| User Satisfaction Score | 7.8/10 | 8.5/10 | SUS (System Usability Scale) questionnaire |
| Learning Time for New Users | Baseline | -30% | Onboarding observation |
| Mobile Task Completion | Difficult | Smooth | Mobile usability testing |

---

## LAMPIRAN

### A. Daftar Screenshot yang Perlu Dilampirkan

Untuk melengkapi laporan ini, lampirkan screenshot berikut:

**Section IV.A (Analisis per Halaman)**:
1. ☐ Screenshot: Halaman Login (normal state)
2. ☐ Screenshot: Halaman Login dengan Error Validation
3. ☐ Screenshot: Dashboard lengkap dengan 4 cards dan chart
4. ☐ Screenshot: Halaman Kasir layout 2 kolom
5. ☐ Screenshot: Modal Struk Transaksi
6. ☐ Screenshot: Halaman Inventory dengan tabel
7. ☐ Screenshot: Modal Form Tambah Stok
8. ☐ Screenshot: Halaman Varian dengan toggle status
9. ☐ Screenshot: Halaman Riwayat Stok dengan filter
10. ☐ Screenshot: Halaman Laporan dengan tab navigation

**Section IV.B (Desain Antarmuka)**:
11. ☐ Screenshot: Color Palette yang digunakan
12. ☐ Screenshot: Button States (normal, hover, disabled, loading)
13. ☐ Screenshot: Form dengan Validasi Error
14. ☐ Screenshot: Confirmation Modal
15. ☐ Screenshot: Toast Notifications (success & error)
16. ☐ Screenshot: Responsive - Desktop vs Tablet vs Mobile

**Section V (Mockup Perbaikan)**:
17. ☐ Mockup: Pagination controls di bawah tabel
18. ☐ Mockup: Hamburger menu dan collapsible sidebar (mobile)
19. ☐ Mockup: Search bar di Inventory
20. ☐ Mockup: Default price dengan margin calculator
21. ☐ Mockup: Section pembayaran dengan kalkulator kembalian
22. ☐ Mockup: Bulk actions dengan checkbox
23. ☐ Mockup: Quick quantity selector di Kasir
24. ☐ Mockup: Tooltips untuk inline help
25. ☐ Mockup: Empty state illustration

---

### B. Referensi & Sumber

**Teori Usabilitas**:
- Nielsen, J. (1994). *Usability Engineering*. Morgan Kaufmann.
- Nielsen, J. & Molich, R. (1990). *Heuristic evaluation of user interfaces*. CHI '90 Proceedings.
- ISO 9241-11:2018 - *Ergonomics of human-system interaction*

**Design Principles**:
- Norman, D. (2013). *The Design of Everyday Things*. Basic Books.
- Krug, S. (2014). *Don't Make Me Think, Revisited*. New Riders.
- Nielsen Norman Group. https://www.nngroup.com

**Web Accessibility**:
- W3C Web Accessibility Initiative. *WCAG 2.1 Guidelines*. https://www.w3.org/WAI/WCAG21/quickref/

---

### C. Tentang Penulis

**Nama**: [Nama Lengkap Mahasiswa]
**NIM**: [Nomor Induk Mahasiswa]
**Program Studi**: [Nama Prodi]
**Mata Kuliah**: Interaksi Manusia dan Komputer
**Dosen Pengampu**: [Nama Dosen]
**Semester**: [Semester] - Tahun Akademik [20XX/20XX]

---

### D. Lampiran Data Tambahan

**D.1 User Persona**

**Persona 1: Admin Gudang**
- Nama: Budi, 35 tahun
- Role: Admin/Supervisor Gudang
- Tech Savvy: Medium
- Goals: Monitoring stok, melihat laporan, manage inventory
- Pain Points: Perlu akses cepat ke data, sering multitasking

**Persona 2: Kasir**
- Nama: Siti, 28 tahun
- Role: Kasir/Operator POS
- Tech Savvy: Low-Medium
- Goals: Transaksi cepat, cetak struk, avoid errors
- Pain Points: Antrian customer, harus cepat dan akurat

**D.2 Task Scenarios untuk Testing**

**Scenario 1: Transaksi Penjualan** (Kasir)
1. Login sebagai kasir
2. Cari produk "Aqua 600ml"
3. Tambahkan 5 pcs ke keranjang
4. Set harga jual Rp3.000/pcs
5. Checkout
6. Cetak struk

**Scenario 2: Tambah Stok** (Admin)
1. Login sebagai admin
2. Buka halaman Inventory
3. Klik "Tambah Stok"
4. Pilih produk "Aqua 1500ml"
5. Input quantity 100 pcs
6. Input harga beli Rp5.000/pcs
7. Save

**Scenario 3: Lihat Laporan** (Admin)
1. Login sebagai admin
2. Buka halaman Laporan
3. Pilih tab "Laporan Penjualan"
4. Filter bulan ini
5. Export ke PDF

---

**Tanggal Penyusunan**: [DD/MM/YYYY]

---

*Laporan ini disusun sebagai tugas mata kuliah Interaksi Manusia dan Komputer untuk menganalisis usabilitas sistem Manajemen Inventory & Kasir Gudang Amanah Lintang.*
