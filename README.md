# 🧩 Panduan Lengkap Pembuatan Ekstensi KonMik (Komik & Novel)

Selamat datang di repositori dan panduan pengembangan ekstensi **KonMik**!  
Ekstensi KonMik memungkinkan komunitas maupun AI Agent untuk menambahkan sumber bacaan baru (baik situs **Komik** maupun **Novel**) ke dalam aplikasi KonMik secara modular, aman, dan tanpa perlu melakukan *recompile* atau *update* aplikasi.

---

## 📑 Daftar Isi
1. [Arsitektur & Lingkungan Runtime](#-arsitektur--lingkungan-runtime)
2. [Daftar Ekstensi Resmi](#-daftar-ekstensi-resmi)
3. [Format Header Metadata (Wajib)](#-format-header-metadata-wajib)
4. [Spesifikasi Ekstensi Komik (`type: comic`)](#-spesifikasi-ekstensi-komik-type-comic)
5. [Spesifikasi Ekstensi Novel (`type: novel`)](#-spesifikasi-ekstensi-novel-type-novel)
6. [Dukungan Ilustrasi Gambar di Novel](#-dukungan-ilustrasi-gambar-di-novel)
7. [Template Boilerplate Siap Pakai](#-template-boilerplate-siap-pakai)
   - [Boilerplate Komik](#-boilerplate-ekstensi-komik)
   - [Boilerplate Novel](#-boilerplate-ekstensi-novel)
8. [Panduan Khusus untuk AI Agent (Prompting Guide)](#-panduan-khusus-untuk-ai-agent-prompting-guide)
9. [Cara Publikasi & Pemasangan di Aplikasi](#-cara-publikasi--pemasangan-di-aplikasi)

---

## ⚡ Arsitektur & Lingkungan Runtime

Ekstensi KonMik berupa **file JavaScript tunggal (`.js`)** standar ES2020 yang dieksekusi di dalam Flutter menggunakan engine **QuickJS**.

- **Mesin JS**: QuickJS (Ringan, aman dalam *sandbox*, dan sangat cepat).
- **Networking (`fetch`)**: Tersedia fungsi `fetch(url, options)` global berbasis asynchronous bridge ke Dart.
  - Mendukung `headers` (seperti `User-Agent`, `Referer`, `Cookie`).
  - Mendukung method `GET`, `POST`, `PUT`, `DELETE`.
  - Otomatis membypass restriksi CORS web browser.
- **Isolasi Lingkungan**:
  - ❌ Tidak ada objek `window`, `document`, atau `DOMParser`.
  - ❌ Tidak mendukung modul Node.js (`require()`, `import`, `fs`, `axios`, `cheerio`).
  - ✅ Parsing HTML dilakukan menggunakan ekspresi reguler murni (**RegExp**) atau string manipulation.
  - ✅ JSON parsing (`JSON.parse()`, `JSON.stringify()`) didukung penuh.

---

## 📦 Daftar Ekstensi Resmi

| ID | Nama Sumber | Kategori | Bahasa | File Sumber | Tautan Gist Raw Siap Pakai |
|---|---|---|---|---|---|
| `ext_softkomik` | **SoftKomik** | Komik | Indonesia | [softkomik.js](./softkomik.js) | Public Gist |
| `ext_novel_indowebnovel` | **IndoWebNovel** | Novel | Indonesia | [indowebnovel.js](./indowebnovel.js) | [Tautan Raw Gist](https://gist.githubusercontent.com/Faaizhamdhy/51dc2c60c6e6142f44ecbe1e65d701c6/raw/indowebnovel.js) |

---

## 🏷️ Format Header Metadata (Wajib)

Setiap file ekstensi **WAJIB** mencantumkan metadata di baris paling atas menggunakan format komentar:

```javascript
// ID: ext_namasitus
// NAME: Nama Tampilan Sumber
// TYPE: comic
// VERSION: 1.0.0
// COLOR: #00ADB5
// ICON: https://www.google.com/s2/favicons?domain=namasitus.com&sz=64
// REFERER: https://namasitus.com/
```

### Penjelasan Kunci Metadata:
| Kunci | Wajib | Keterangan | Contoh |
|---|---|---|---|
| `// ID:` | **Ya** | ID unik ekstensi. Wajib diawali `ext_` untuk komik, atau `ext_novel_` untuk novel. | `ext_softkomik` atau `ext_novel_indowebnovel` |
| `// NAME:` | **Ya** | Nama sumber yang tampil di antarmuka KonMik. | `SoftKomik` |
| `// TYPE:` | **Ya** | Kategori ekstensi: `comic` (komik/manga/manhwa) atau `novel` (web novel/light novel). | `comic` atau `novel` |
| `// VERSION:` | **Ya** | Versi ekstensi (Semantic Versioning). | `1.0.0` |
| `// COLOR:` | Tidak | Kode warna tema HEX untuk badge dan aksen tombol. | `#00897B` (toska) / `#6C5CE7` (ungu) |
| `// ICON:` | **Ya** | URL langsung ikon/favicon situs (rekomendasi menggunakan favicon Google CDN agar anti-404). | `https://www.google.com/s2/favicons?domain=domain.com&sz=64` |
| `// REFERER:` | Tidak | Nilai default header `Referer` saat mengunduh gambar komik atau cover. | `https://namasitus.com/` |

---

## 🎨 Spesifikasi Ekstensi Komik (`type: comic`)

Objek global wajib bernama `var KonmikExtension = { ... }`.  
Untuk komik, Anda **harus mengimplementasikan 3 fungsi utama**:

### 1. `getList(page, query, filters)`
Dipanggil saat membuka katalog komik, explore global, atau pencarian komik.
- **Parameter**:
  - `page` *(number)*: Nomor halaman (dimulai dari `1`).
  - `query` *(string)*: Kata kunci pencarian (string kosong jika katalog biasa).
  - `filters` *(object)*: Filter penyortiran, contoh: `{ sort: 'latest' | 'popular' }`.
- **Return**: `Promise<{ manga_list: Array<ComicItem> }>`

#### Skema `ComicItem`:
```json
{
  "id": "slug-judul-komik",
  "title": "Judul Komik",
  "cover_url": "https://domain.com/covers/image.jpg",
  "latest_chapter": "Ch. 120",
  "rating": "9.5",
  "views": "1.2M"
}
```

### 2. `getDetail(slug)`
Dipanggil saat pengguna mengetuk kartu komik untuk membuka halaman detail.
- **Parameter**: `slug` *(string)*: ID atau slug komik dari `ComicItem.id`.
- **Return**: `Promise<ComicDetail>`

#### Skema `ComicDetail`:
```json
{
  "title": "Judul Komik",
  "cover_url": "https://domain.com/covers/image.jpg",
  "description": "Sinopsis lengkap komik...",
  "author": "Nama Penulis",
  "artist": "Nama Ilustrator",
  "rating": "9.5",
  "views": "1.2M",
  "genres": ["Action", "Adventure", "Fantasy"],
  "chapters": [
    {
      "id": "ch-1",
      "title": "Chapter 1",
      "endpoint": "https://domain.com/chapter-1/",
      "date": "2 hari yang lalu"
    }
  ]
}
```
> [!IMPORTANT]
> **Aturan Urutan Bab Komik**:  
> Array `chapters` **HARUS diurutkan secara Ascending** (Bab 1 / bab paling awal berada di index `0`). Detail Screen KonMik akan otomatis membalik urutannya saat menampilkan ke pengguna.

### 3. `getChapterImages(chapterId)`
Dipanggil saat pengguna membaca chapter untuk mengambil seluruh URL gambar halaman komik.
- **Parameter**: `chapterId` *(string)*: Nilai dari `chapters[i].endpoint` atau `chapters[i].id`.
- **Return**: `Promise<Array<string>>` (Daftar URL gambar halaman berurutan).

---

## 📖 Spesifikasi Ekstensi Novel (`type: novel`)

Objek global wajib bernama `var KonmikExtension = { ... }`.  
Untuk novel, Anda **harus mengimplementasikan 3 fungsi utama**:

### 1. `getList(page, query, filters)`
Dipanggil pada halaman Explore Novel, Katalog Novel Ekstensi, atau pencarian judul novel.
- **Parameter**:
  - `page` *(number)*: Nomor halaman (dimulai dari `1`).
  - `query` *(string)*: Kata kunci pencarian (string kosong jika melihat katalog).
  - `filters` *(object)*: Objek filter, contoh: `{ sort: 'popular' | 'latest', genre: '...', status: '...' }`.
- **Return**: `Promise<Array<NovelItem>>`

#### Skema `NovelItem`:
```json
[
  {
    "id": "slug-novel",
    "slug": "slug-novel",
    "title": "Judul Novel",
    "cover": "https://domain.com/cover.jpg",
    "source": "ext_novel_namasumber",
    "type": "Web Novel",
    "status": "Ongoing"
  }
]
```

### 2. `getDetail(slug)`
Dipanggil saat pengguna membuka halaman info dan daftar bab novel.
- **Parameter**: `slug` *(string)*: ID atau slug novel.
- **Return**: `Promise<NovelDetail>`

#### Skema `NovelDetail`:
```json
{
  "title": "Judul Novel",
  "cover": "https://domain.com/cover.jpg",
  "synopsis": "Sinopsis novel...",
  "author": "Nama Penulis",
  "type": "Light Novel",
  "status": "Ongoing",
  "genres": ["Isekai", "Fantasy", "Action"],
  "chapters": [
    {
      "id": 1,
      "title": "Chapter 1 - Awal Mula",
      "slug": "https://domain.com/series/novel/chapter-1/",
      "date": "3 hari lalu",
      "chapter_number": "Chapter 1"
    }
  ]
}
```
> [!TIP]
> **Aturan Urutan Bab Novel**:  
> Array `chapters` diurutkan dari **Bab 1 (tertua) ke Bab Terbaru**, agar pembaca dapat membaca secara berurutan atau menggunakan fitur lompat bab dengan mudah.

### 3. `getChapterContent(chapterSlug)`
Dipanggil saat pengguna membuka bab tertentu di **Novel Reader**.
- **Parameter**: `chapterSlug` *(string)*: Nilai dari `chapters[i].slug`.
- **Return**: `Promise<{ title: string, html: string }>`

#### Skema Return:
```json
{
  "title": "Chapter 1: Kebangkitan",
  "html": "<p>Paragraf pertama...</p><p>Paragraf kedua...</p><img src=\"https://domain.com/ilustrasi.jpg\" /><p>Paragraf lanjutan...</p>"
}
```

---

## 🖼️ Dukungan Ilustrasi Gambar di Novel

KonMik memiliki dukungan bawaan untuk **ilustrasi/gambar di dalam bab novel**!

Jika suatu bab mengandung gambar (misalnya ilustrasi karakter, peta dunia, atau sampul bab):
1. Cukup sertakan tag `<img>` di dalam string `html` yang dikembalikan oleh `getChapterContent()`.  
   Contoh: `<p>Tiba-tiba monster itu muncul:</p><img src="https://domain.com/monster.jpg" /><p>Pertarungan pun dimulai...</p>`
2. **Mesin Pembaca KonMik akan otomatis**:
   - Mengekstrak gambar menjadi blok visual mandiri (`NovelContentBlock`).
   - Menyediakan fitur kartu estetis, *image caching* offline, dan modal **Pinch-to-Zoom** interaktif saat gambar diketuk.
   - Kompatibel baik pada mode baca vertikal (*scroll*) maupun mode balik halaman (*page-flip*).

---

## 📋 Template Boilerplate Siap Pakai

### 🎨 Boilerplate Ekstensi Komik
Simpan dengan nama `ext_namakomik.js`:

```javascript
// ID: ext_contohkomik
// NAME: ContohKomik
// TYPE: comic
// VERSION: 1.0.0
// COLOR: #6C5CE7
// ICON: https://www.google.com/s2/favicons?domain=contohkomik.com&sz=64
// REFERER: https://contohkomik.com/

var KonmikExtension = {
  baseUrl: "https://contohkomik.com",

  async getList(page = 1, query = '', filters = {}) {
    page = page || 1;
    let url = query 
      ? `${this.baseUrl}/page/${page}/?s=${encodeURIComponent(query)}`
      : `${this.baseUrl}/komik/page/${page}/`;

    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();

    const list = [];
    // Contoh parsing regex untuk daftar komik
    const regex = /<div class="manga-card"[\s\S]*?<a href="([^"]+)" title="([^"]+)"[\s\S]*?<img src="([^"]+)"/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      list.push({
        id: match[1].replace(this.baseUrl, '').replace(/\//g, ''),
        title: match[2].trim(),
        cover_url: match[3],
        latest_chapter: "Latest"
      });
    }
    return { manga_list: list };
  },

  async getDetail(slug) {
    const url = slug.startsWith('http') ? slug : `${this.baseUrl}/manga/${slug}/`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();

    // Parse judul, cover, sinopsis, dan daftar chapter
    const chapters = [];
    const chRegex = /<li class="chapter-item"[\s\S]*?<a href="([^"]+)">([^<]+)<\/a>/gi;
    let chMatch;
    while ((chMatch = chRegex.exec(html)) !== null) {
      chapters.push({
        id: chMatch[1],
        title: chMatch[2].trim(),
        endpoint: chMatch[1],
        date: ""
      });
    }
    // Pastikan bab terlama / Bab 1 di posisi index 0
    chapters.reverse();

    return {
      title: "Judul Komik",
      cover_url: "",
      description: "Sinopsis...",
      chapters: chapters
    };
  },

  async getChapterImages(chapterId) {
    const url = chapterId.startsWith('http') ? chapterId : `${this.baseUrl}/${chapterId}/`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();

    const images = [];
    const imgRegex = /<img[^>]+class="reader-img"[^>]+src="([^"]+)"/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1]);
    }
    return images;
  }
};
```

---

### 📖 Boilerplate Ekstensi Novel
Simpan dengan nama `ext_novel_namanovel.js`:

```javascript
// ID: ext_novel_contohnovel
// NAME: ContohNovel
// TYPE: novel
// VERSION: 1.0.0
// COLOR: #00897B
// ICON: https://www.google.com/s2/favicons?domain=contohnovel.com&sz=64
// REFERER: https://contohnovel.com/

var KonmikExtension = {
  baseUrl: "https://contohnovel.com",

  async getList(page = 1, query = '', filters = {}) {
    page = page || 1;
    let url = query
      ? `${this.baseUrl}/?s=${encodeURIComponent(query)}`
      : `${this.baseUrl}/novel/page/${page}/`;

    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();

    const novels = [];
    const regex = /<div class="novel-item"[\s\S]*?<a href="([^"]+)" title="([^"]+)"[\s\S]*?<img src="([^"]+)"/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      novels.push({
        id: match[1].replace(this.baseUrl, '').replace(/\//g, ''),
        slug: match[1],
        title: match[2].trim(),
        cover: match[3],
        source: "ext_novel_contohnovel",
        type: "Web Novel",
        status: "Ongoing"
      });
    }
    return novels;
  },

  async getDetail(slug) {
    const url = slug.startsWith('http') ? slug : `${this.baseUrl}/series/${slug}/`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();

    const chapters = [];
    const chRegex = /<a class="ch-link" href="([^"]+)">([^<]+)<\/a>/gi;
    let match;
    let idx = 1;
    while ((match = chRegex.exec(html)) !== null) {
      chapters.push({
        id: idx++,
        title: match[2].trim(),
        slug: match[1],
        date: "",
        chapter_number: `Chapter ${idx}`
      });
    }
    // Urutkan dari Bab 1 ke terbaru
    chapters.reverse();

    return {
      title: "Judul Novel",
      cover: "",
      synopsis: "Sinopsis novel...",
      genres: ["Action", "Fantasy"],
      status: "Ongoing",
      type: "Web Novel",
      chapters: chapters
    };
  },

  async getChapterContent(chapterSlug) {
    const url = chapterSlug.startsWith('http') ? chapterSlug : `${this.baseUrl}/${chapterSlug}/`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();

    let contentHtml = "";
    const bodyMatch = html.match(/<div class="chapter-content"[^>]*>([\s\S]*?)<\/div>/i);
    if (bodyMatch) {
      contentHtml = bodyMatch[1];
    }

    // Bersihkan script dan elemen pengganggu
    contentHtml = contentHtml.replace(/<script[\s\S]*?<\/script>/gi, '');
    contentHtml = contentHtml.replace(/<style[\s\S]*?<\/style>/gi, '');

    return {
      title: "Judul Chapter",
      html: contentHtml // Tag <p> dan <img> akan dirender otomatis oleh KonMik
    };
  }
};
```

---

## 🤖 Panduan Khusus untuk AI Agent (Prompting Guide)

Jika Anda ingin meminta AI Agent (seperti Claude, ChatGPT, Gemini, atau Antigravity) untuk membuatkan ekstensi baru dari situs web komik/novel tertentu, Anda dapat menyalin prompt di bawah:

### 💬 Contoh Template Prompt untuk AI Agent:

> *"Tolong buatkan file ekstensi JavaScript tunggal untuk aplikasi **KonMik** dari situs `https://target-situs.com`.*  
> *Ketentuan wajib:*
> 1. *Target tipe: `[comic / novel]`.*
> 2. *Tulis metadata header lengkap (`ID`, `NAME`, `TYPE`, `VERSION`, `COLOR`, `ICON`, `REFERER`).*
> 3. *Ekspos objek `var KonmikExtension = { getList, getDetail, [getChapterImages / getChapterContent] }`.*
> 4. *Gunakan hanya JavaScript ES2020 standar (QuickJS), fungsi `fetch()`, dan parsing HTML via **RegExp / String Manipulation** murni.*
> 5. *Jangan gunakan `cheerio`, `axios`, `require()`, atau objek `document/window`.*
> 6. *Untuk novel, pastikan gambar/ilustrasi di dalam teks bab tetap berada di dalam tag `<img>` pada output `html`.*
> 7. *Urutan bab harus dimulai dari Bab 1 / Bab paling awal.*"

---

## 🚀 Cara Publikasi & Pemasangan di Aplikasi

### 1. Unggah ke GitHub Gist
1. Kunjungi **[gist.github.com](https://gist.github.com/)**.
2. Masukkan nama file (contoh: `indowebnovel.js` atau `softkomik.js`).
3. Tempel seluruh kode JavaScript ekstensi Anda.
4. Klik **Create public gist**.
5. Di halaman Gist Anda, klik tombol **Raw** lalu salin URL yang ada di address bar browser.
   - Format URL Raw Gist:  
     `https://gist.githubusercontent.com/<username>/<gist_id>/raw/<namafile>.js`

### 2. Pasang di Aplikasi KonMik
- **Untuk Ekstensi Novel**:
  1. Buka aplikasi **KonMik** ➡️ Tab **Explore Novel**.
  2. Ketuk ikon **Pengaturan Sumber** di pojok kanan atas AppBar.
  3. Pada bagian **Ekstensi Novel**, ketuk **Pasang via URL** (atau **+ Pasang Baru**).
  4. Tempel URL Raw Gist Anda ➡️ Ketuk **Instal**.
- **Untuk Ekstensi Komik**:
  1. Buka menu **Explore Komik** atau **Profile** ➡️ **Source Settings**.
  2. Pada bagian **Ekstensi Komunitas**, ketuk **Pasang via URL** (atau tanda `+`).
  3. Tempel URL Raw Gist Anda ➡️ Ketuk **Instal**.

---

## 🤝 Kontribusi & Bantuan
Punya ekstensi yang sudah berfungsi dan ingin dibagikan ke pengguna lain?  
Buat *Pull Request* atau daftarkan tautan Gist Anda pada tabel ekstensi di atas agar pengguna lain dapat menikmatinya!
