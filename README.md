# Situs Penerbit Yeay Press (yeaypress.my.id)

Situs statis untuk penerbit buku pendidikan dan novel. Buku dijual lewat Google Play Buku; setiap halaman buku memuat tombol ke halaman buku di sana.

## 1. Isi data
**`data/site.json`**: ganti `ISI_EMAIL_PENERBIT` dan `ISI_KOTA_PENERBIT`. Kolom `wa` (nomor WhatsApp format 6281234567890) dan `formNaskah` (tautan Google Forms) boleh dikosongkan; jika `formNaskah` kosong, halaman naskah mengarahkan ke email.

**`data/books.json`**: satu blok per buku. Hapus dua buku contoh dan kolom `"contoh": true`.

| Kolom | Isi |
|---|---|
| `slug` | alamat halaman, huruf kecil dipisah tanda hubung, unik |
| `judul`, `penulis` | teks |
| `kategori` | `Pendidikan` atau `Novel` |
| `tahun`, `halaman`, `harga` | angka |
| `status` | `Tersedia` atau `Dalam proses terbit` |
| `isbn` | nomor ISBN; kosongkan jika masih dalam proses |
| `sampul` | nama berkas gambar di folder `public/sampul` (mis. `novel-saya.jpg`), rasio 2:3 |
| `tautanGoogleBooks` | tautan halaman buku di Google Play Buku (https://...); kosongkan jika belum terbit |
| `deskripsi` | satu atau dua kalimat |
| `sinopsis` | satu paragraf |
| `warna` | koral, kuning, mint, langit, jeruk, ungu, tinta (dipakai pada rak buku di beranda) |

Katalog untuk Perpusnas minimal memuat cover, judul, penulis, harga, deskripsi, dan sinopsis; ISBN boleh menyusul.

## 2. Membangun situs
Syarat: Node.js 18 atau lebih baru.

```
npm install
npm run build
npm run preview     (buka http://localhost:3000, hentikan dengan Ctrl+C)
```
Hasilnya ada di folder `dist`. Build berhenti dengan pesan jelas jika data masih contoh atau kolom wajib kosong.

## 3. Memasang di Cloudflare Pages (gratis)
1. Buat akun di cloudflare.com.
2. Buka **Workers & Pages**, pilih **Create**, lalu **Pages**, lalu **Upload assets** (unggah langsung).
3. Beri nama proyek, lalu seret folder `dist`, kemudian **Deploy**.
4. Buka **Custom domains**, tambahkan `yeaypress.my.id`, dan ikuti petunjuknya. Untuk domain utama (tanpa www), Cloudflare umumnya meminta nameserver domain diarahkan ke Cloudflare; ubah nameserver itu di registrar tempat domain dibeli.
5. Setiap kali data berubah: `npm run build`, lalu unggah ulang folder `dist`.

## Struktur
```
build.js        pembuat situs statis
preview.js      pratinjau lokal
data/           site.json dan books.json
views/          templat halaman (EJS)
public/         css, js, favicon, folder sampul/
```
