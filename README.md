# Inventory & Kasir Frontend

Frontend aplikasi inventory dan kasir menggunakan React, Tailwind CSS, dan Vite.

## Features

✅ Authentication (Login/Logout)
✅ Role-based Access Control (Admin & Kasir)
✅ Dashboard dengan statistik real-time
✅ Inventory Management (CRUD barang)
✅ Point of Sale (Kasir/Transaksi)
✅ Laporan Lengkap (Penjualan, Stok, Transaksi)
✅ Export ke Excel & PDF
✅ Responsive Design
✅ Modern UI dengan Tailwind CSS

## Tech Stack

- **React** 19.1.1 - UI Library
- **Vite** 7.1.7 - Build tool
- **React Router** 7.1.4 - Routing
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling
- **React Icons** - Icons
- **Recharts** - Charts/Grafik

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit `.env` dan sesuaikan dengan backend URL Anda:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

File hasil build akan ada di folder `dist/`

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
project-skripsi-fe/
├── public/               # Static files
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   └── PrivateRoute.jsx
│   ├── context/         # React Context
│   │   └── AuthContext.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Inventory.jsx
│   │   ├── Kasir.jsx
│   │   └── Laporan.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── .env.example         # Environment template
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## User Roles & Access

### Admin
- ✅ Dashboard (statistik & grafik)
- ✅ Inventory (kelola barang)
- ✅ Kasir (transaksi penjualan)
- ✅ Laporan (download Excel & PDF)

### Kasir
- ✅ Kasir (transaksi penjualan saja)
- ❌ Tidak bisa akses modul lain

## Default Accounts

Setelah backend running dan di-seed:

**Admin:**
- Username: `admin`
- Password: `admin123`

**Kasir:**
- Username: `kasir`
- Password: `kasir123`

## Features Detail

### 1. Login
- Login dengan username & password
- Auto redirect berdasarkan role
- Session management dengan localStorage

### 2. Dashboard (Admin Only)
- Ringkasan penjualan hari ini
- Ringkasan penjualan bulan ini
- Jumlah transaksi
- Keuntungan
- Statistik inventory
- Grafik penjualan 7 hari terakhir

### 3. Inventory (Admin Only)
- Tambah barang masuk (auto update stok)
- Edit informasi barang (nama, kategori)
- Hapus barang
- Lihat riwayat barang masuk
- Indikator stok hampir habis

### 4. Kasir (Admin & Kasir)
- Pilih produk dari daftar
- Tambah ke keranjang
- Input harga jual manual per item
- Lihat subtotal otomatis
- Checkout transaksi
- Tampilan nota/receipt

### 5. Laporan (Admin Only)
- **Laporan Penjualan:**
  - Ringkasan total penjualan & keuntungan
  - Filter by periode
  - Daftar transaksi
  - Export Excel & PDF

- **Laporan Stok:**
  - Total produk & nilai stok
  - Barang hampir habis
  - Barang terlaris
  - Export Excel & PDF

- **Laporan Transaksi:**
  - Total transaksi & rata-rata
  - Rekap per kasir
  - Detail transaksi
  - Export Excel & PDF

## API Integration

Frontend terintegrasi dengan backend melalui Axios. Semua endpoint API ada di `src/services/api.js`:

- Auth APIs (login, register, getMe)
- Inventory APIs (CRUD products)
- Kasir APIs (transactions)
- Dashboard APIs (reports & statistics)
- Export APIs (Excel & PDF download)

JWT Token disimpan di localStorage dan otomatis ditambahkan ke setiap request.

## Styling

Aplikasi menggunakan Tailwind CSS dengan custom configuration:

- Primary color: Blue (#3b82f6)
- Custom scrollbar styling
- Responsive grid & layout
- Custom loading spinner

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

### Hot Module Replacement (HMR)
Vite mendukung HMR, jadi perubahan code akan langsung terlihat tanpa refresh.

### Debugging
Gunakan React DevTools untuk debugging components & context.

### API Development
Pastikan backend sudah running sebelum menjalankan frontend. Default backend URL: `http://localhost:5000`

## Troubleshooting

### CORS Error
Pastikan backend sudah mengaktifkan CORS. Backend sudah include `cors` middleware.

### API Connection Failed
- Cek apakah backend sudah running
- Cek VITE_API_URL di file `.env`
- Cek network tab di browser DevTools

### Build Error
```bash
# Clear node_modules dan reinstall
rm -rf node_modules
npm install
```

## Production Deployment

### Build
```bash
npm run build
```

### Serve Static Files
Hasil build di folder `dist/` bisa di-serve dengan:
- Nginx
- Apache
- Vercel
- Netlify
- atau static hosting lainnya

### Environment Variables
Pastikan set `VITE_API_URL` ke production backend URL.

---

Dibuat dengan ❤️ menggunakan React + Vite + Tailwind CSS
