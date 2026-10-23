# Toko Baju Online - Front-End E-Commerce

Tugas 7 - E-Business System (Pertemuan 7: Pengembangan Front-End E-Commerce Sederhana)

- **Nama:** Yemima Milka Dalita
- **NIM:** 24208079
- **Program Studi:** Pendidikan Teknologi Informasi dan Komunikasi, Fakultas Teknik, Universitas Negeri Manado
- **Studi kasus:** Toko Baju Online (rancangan Tugas 4, 5, dan 6)

## Deskripsi

Front-end e-commerce toko baju yang dibangun dengan **HTML, CSS, dan JavaScript** murni. Antarmuka mengikuti rancangan sebelumnya: kebutuhan (Tugas 4), Use Case dan ERD (Tugas 5), serta alur transaksi dan database (Tugas 6). Stok disimpan per varian (ukuran dan warna) sesuai tabel `PRODUCT_VARIANT`.

> Ini **simulasi front-end**. Data (akun, keranjang, pesanan, stok) disimpan di `localStorage` browser dan belum terhubung ke database. Integrasi PHP/MySQL dikerjakan pada tahap back-end.

## Struktur Folder

```
toko-baju-online/
├── index.html      # Home: hero, kategori, produk unggulan, cara belanja
├── product.html    # Katalog (cari, filter, urut) dan detail produk (?id=)
├── cart.html       # Keranjang belanja
├── checkout.html   # Form checkout dan ringkasan pesanan
├── orders.html     # Status pesanan, pembayaran, resi, konfirmasi terima
├── login.html      # Login dan registrasi customer
├── css/style.css
├── js/script.js
└── README.md
```

## Cara Menjalankan

1. Unduh atau clone repository ini.
2. Buka `index.html` langsung di browser (Chrome/Edge/Firefox), **atau**
3. Jalankan server lokal: `python -m http.server 8000`, lalu buka `http://localhost:8000`.

Tidak perlu instalasi library. Tombol **Reset data demo** di footer mengembalikan semua data ke kondisi awal.

## Jejak Desain -> Antarmuka

### Use Case (Tugas 5/6) -> Halaman

| Use Case | Halaman / Fitur |
|---|---|
| UC-01 Registrasi / Login | `login.html` (tab Masuk dan Daftar) |
| UC-02 Melihat produk | `index.html`, `product.html` (katalog, cari, filter kategori, urut harga, detail) |
| UC-03 Menambah ke keranjang | `product.html?id=` (pilih warna, ukuran, jumlah) dan `cart.html` |
| UC-04 Checkout | `checkout.html` |
| UC-05 Melakukan pembayaran | `orders.html` (Bayar Sekarang / simulasi gagal / bayar ulang) |
| UC-06 Melihat status pesanan | `orders.html` (timeline status dan no. resi) |
| UC-07 s.d. UC-09 (sisi Admin) | Panel "Simulasi sisi Admin" pada `orders.html` (proses, kirim + resi); halaman admin penuh dikerjakan di tahap back-end |

### Alur Transaksi (Tugas 6) -> Antarmuka

| Langkah alur | Implementasi |
|---|---|
| Pilih produk, ukuran, warna | Detail produk: swatch warna dan tombol ukuran |
| Decision: stok tersedia? | Ukuran stok habis dinonaktifkan; pesan "Stok habis / menipis"; validasi saat tambah ke keranjang |
| Decision: sudah login? | Checkout meminta login/registrasi terlebih dahulu |
| Data pengiriman lengkap? | Validasi form checkout dengan pesan error di dekat field |
| Hitung subtotal, ongkir, total | Ringkasan pesanan berubah langsung saat kurir dipilih |
| Order dibuat (PENDING) | Konfirmasi dialog, lalu order dibuat dan harga disalin ke detail order |
| Pembayaran berhasil/gagal | PAID dan stok berkurang / PAYMENT_FAILED, bisa bayar ulang atau dibatalkan |
| Admin proses dan kirim | PROCESSING, SHIPPED, no. resi terisi |
| Customer menerima | COMPLETED |

Status mengikuti Tugas 6: `PENDING`, `PAYMENT_FAILED`, `PAID`, `PROCESSING`, `SHIPPED`, `COMPLETED`, `CANCELLED`.

## Fitur Front-End

- **HTML:** struktur semantik (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`), `form`, `label`, `input`, `select`, `button`, atribut ARIA.
- **CSS:** variabel warna, product card yang konsisten, **Flexbox** (navigasi, tombol), **CSS Grid** (katalog, ringkasan), box model, **responsive** (3-4 kolom desktop, 1 kolom mobile, menu hamburger).
- **JavaScript:** event `click`, `input`, `change`, `submit`; manipulasi DOM; simulasi keranjang; hitung subtotal/ongkir/total; validasi form; toast sebagai feedback; dialog konfirmasi sebelum aksi penting.
- **UX:** hierarki visual (nama, harga, info, CTA), navigasi konsisten, pencegahan kesalahan (jumlah minimal 1, tidak melebihi stok, field wajib bertanda `*`, konfirmasi hapus/batal/bayar).

## Functional Testing (checklist demo)

Centang setelah dicoba di browser Anda.

| No | Skenario | Hasil yang diharapkan | Status |
|---|---|---|---|
| 1 | Buka Home dan klik menu | Semua halaman terbuka, menu aktif ditandai | [ ] |
| 2 | Katalog: cari "kemeja", filter kategori, urut harga | Daftar produk menyesuaikan; pesan kosong bila tidak ada | [ ] |
| 3 | Product card | Semua card punya gambar, nama, harga, info, tombol | [ ] |
| 4 | Detail: pilih varian stok habis (mis. Kaos Hitam L) | Tombol ukuran nonaktif | [ ] |
| 5 | Tambah ke keranjang | Badge keranjang bertambah dan muncul feedback | [ ] |
| 6 | Keranjang: ubah jumlah, hapus | Subtotal berubah; jumlah tidak melebihi stok; konfirmasi hapus | [ ] |
| 7 | Checkout tanpa login | Diarahkan untuk masuk/daftar | [ ] |
| 8 | Checkout: kirim form kosong / email salah | Pesan error spesifik di tiap field | [ ] |
| 9 | Checkout valid | Total = subtotal + ongkir; order dibuat berstatus PENDING | [ ] |
| 10 | Pembayaran berhasil | Status PAID, stok produk berkurang | [ ] |
| 11 | Pembayaran gagal, bayar ulang, waktu habis | PAYMENT_FAILED, kembali PENDING, atau CANCELLED | [ ] |
| 12 | Proses, kirim, terima | PROCESSING, SHIPPED + no. resi, COMPLETED | [ ] |
| 13 | Ubah lebar layar (desktop, tablet, mobile) | Layout tetap terbaca, menu menjadi hamburger | [ ] |

## Simulasi Contoh (sesuai Tugas 6, C.2)

Rani membeli 2 Kaos Oversize Polos Hitam M (Rp85.000) dan 1 Kemeja Flannel Kotak Merah L (Rp165.000) dengan kurir Reguler (Rp20.000): total **Rp355.000**. Setelah dibayar, stok varian 31 turun dari 40 menjadi 38 dan varian 77 dari 15 menjadi 14.

## Screenshot

Tambahkan tangkapan layar halaman utama, katalog, detail produk, keranjang, checkout, dan pesanan di folder `screenshots/`.

## Catatan Pengembangan Lanjutan

- Back-end (PHP/MySQL): menggantikan `localStorage` dengan tabel `CUSTOMER`, `PRODUCT`, `PRODUCT_VARIANT`, `CART`, `ORDERS`, `ORDER_DETAIL`, `PAYMENT`.
- Kata sandi pada simulasi ini tidak di-hash; pada back-end gunakan `password_hash`.
