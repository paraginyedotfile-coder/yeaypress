'use strict';
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const root = __dirname;
const out = path.join(root, 'dist');
const izinContoh = process.argv.includes('--contoh');
const KATEGORI = ['Pendidikan', 'Novel'];
const WARNA = ['koral', 'kuning', 'mint', 'langit', 'jeruk', 'ungu', 'tinta'];
const STATUS = ['Tersedia', 'Dalam proses terbit'];

const baca = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
let site, buku;
try {
  site = baca('data/site.json');
  buku = baca('data/books.json');
} catch (e) {
  console.error('Gagal membaca berkas JSON (periksa tanda kutip dan koma): ' + e.message);
  process.exit(1);
}

const galat = [];
const peringatan = [];
site.url = String(site.url || '').replace(/\/$/, '');
for (const k of ['nama', 'url', 'email', 'kota']) {
  if (!site[k] || String(site[k]).startsWith('ISI_')) galat.push(`data/site.json: isi kolom "${k}".`);
}
if (!Array.isArray(buku) || !buku.length) galat.push('data/books.json: isi minimal satu buku.');

const slugs = new Set();
(Array.isArray(buku) ? buku : []).forEach((b, i) => {
  const n = `Buku ke-${i + 1} (${b.judul || 'tanpa judul'})`;
  if (b.contoh && !izinContoh) galat.push(`${n}: masih data contoh. Ganti dengan data asli dan hapus kolom "contoh".`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(b.slug || '')) galat.push(`${n}: "slug" harus huruf kecil/angka dipisah tanda hubung.`);
  if (slugs.has(b.slug)) galat.push(`${n}: "slug" dobel.`);
  slugs.add(b.slug);
  for (const k of ['judul', 'penulis', 'deskripsi', 'sinopsis']) {
    if (!String(b[k] || '').trim()) galat.push(`${n}: "${k}" kosong.`);
  }
  if (!KATEGORI.includes(b.kategori)) galat.push(`${n}: "kategori" harus salah satu dari ${KATEGORI.join(', ')}.`);
  if (!STATUS.includes(b.status)) galat.push(`${n}: "status" harus salah satu dari ${STATUS.join(', ')}.`);
  if (!(Number(b.harga) > 0)) galat.push(`${n}: "harga" harus berupa angka lebih dari 0.`);
  if (!(Number(b.tahun) > 2000)) galat.push(`${n}: "tahun" harus berupa angka.`);
  if (!(Number(b.halaman) > 0)) galat.push(`${n}: "halaman" harus berupa angka.`);
  if (!WARNA.includes(b.warna)) b.warna = 'ungu';
  if (b.tautanGoogleBooks && !/^https:\/\//.test(b.tautanGoogleBooks)) galat.push(`${n}: "tautanGoogleBooks" harus diawali https://.`);
  if (b.sampul && !fs.existsSync(path.join(root, 'public', 'sampul', b.sampul))) {
    galat.push(`${n}: berkas sampul "${b.sampul}" tidak ada di folder public/sampul.`);
  }
  if (!b.sampul) peringatan.push(`${n}: belum ada gambar sampul (Perpusnas meminta cover buku).`);
});

if (galat.length) {
  console.error('Build dihentikan:\n- ' + galat.join('\n- '));
  process.exit(1);
}
peringatan.forEach((p) => console.warn('Peringatan: ' + p));

const rupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, 'public'), out, { recursive: true });

const tulis = (rel, isi) => {
  const f = path.join(out, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, isi);
};
const halaman = (rel, view, locals) => {
  const file = path.join(root, 'views', view + '.ejs');
  const canonical = site.url + '/' + rel.replace(/(^|\/)index\.html$/, '$1');
  const html = ejs.render(
    fs.readFileSync(file, 'utf8'),
    { site, rupiah, kategoriSemua: KATEGORI, canonical, skrip: '', ...locals },
    { filename: file }
  );
  tulis(rel, html);
};

const terbaru = [...buku].sort((a, b) => b.tahun - a.tahun).slice(0, 4);
const hitung = KATEGORI.map((k) => ({ nama: k, jumlah: buku.filter((b) => b.kategori === k).length }));

halaman('index.html', 'index', {
  title: 'Yeay | Penerbit buku pendidikan dan novel',
  desc: 'Yeay menerbitkan buku pendidikan dan novel dari penulis Indonesia.',
  buku, terbaru, hitung,
});
halaman('katalog/index.html', 'katalog', {
  title: 'Katalog buku | Yeay',
  desc: 'Daftar buku pendidikan dan novel terbitan Yeay.',
  buku, skrip: 'katalog.js',
});
buku.forEach((b) => {
  const terkait = buku.filter((x) => x.kategori === b.kategori && x.slug !== b.slug).slice(0, 4);
  halaman(`buku/${b.slug}/index.html`, 'buku', {
    title: `${b.judul} | Yeay`,
    desc: b.deskripsi.slice(0, 155),
    b, terkait,
  });
});
halaman('tentang/index.html', 'tentang', { title: 'Tentang Yeay', desc: 'Profil penerbit Yeay dan cara menghubungi redaksi.' });
halaman('naskah/index.html', 'naskah', { title: 'Kirim naskah | Yeay', desc: 'Cara mengirim naskah buku pendidikan atau novel ke redaksi Yeay.' });
halaman('404.html', 'galat', {
  title: 'Halaman tidak ditemukan | Yeay', desc: '', kode: 404,
  pesan: 'Halaman yang Anda cari tidak ada atau sudah dipindahkan.',
});

const urls = ['/', '/katalog/', '/naskah/', '/tentang/', ...buku.map((b) => `/buku/${b.slug}/`)];
tulis('sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${site.url}${u}</loc></url>`).join('\n') + `\n</urlset>\n`);
tulis('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);

console.log(`Selesai: ${buku.length} buku, ${urls.length + 1} halaman. Hasil ada di folder "dist".`);
