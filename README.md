# 🧩 Panduan Lengkap Pembuatan Ekstensi KonMik (Komik & Novel)

Selamat datang di repositori resmi **[KonMIk-Extension-](https://github.com/Faaizhamdhy/KonMIk-Extension-)**!  
Ekstensi KonMik memungkinkan pengguna dan AI Coding Agent untuk menambahkan sumber bacaan baru (baik situs **Komik** maupun **Novel**) ke dalam aplikasi KonMik secara mandiri, modular, dan langsung aktif tanpa perlu mengompilasi ulang aplikasi.

---

## 📑 Daftar Isi
1. [Arsitektur & Lingkungan Runtime](#-arsitektur--lingkungan-runtime)
2. [Daftar Ekstensi Resmi](#-daftar-ekstensi-resmi)
3. [Format Header Metadata (Wajib)](#-format-header-metadata-wajib)
4. [Spesifikasi Ekstensi Komik (`type: comic`)](#-spesifikasi-ekstensi-komik-type-comic)
5. [Spesifikasi Ekstensi Novel (`type: novel`)](#-spesifikasi-ekstensi-novel-type-novel)
6. [Dukungan Ilustrasi Gambar di Novel](#-dukungan-ilustrasi-gambar-di-novel)
7. [Contoh Kode Ekstensi Lengkap Siap Pakai](#-contoh-kode-ekstensi-lengkap-siap-pakai)
   - [Contoh Komik: `webtoon.js`](#-1-contoh-ekstensi-komik-webtoonjs)
   - [Contoh Novel: `indowebnovel.js`](#-2-contoh-ekstensi-novel-indowebnoveljs)
8. [Panduan Khusus untuk AI Agent (Prompting Guide)](#-panduan-khusus-untuk-ai-agent-prompting-guide)
9. [Cara Memasang Ekstensi di Aplikasi KonMik](#-cara-memasang-ekstensi-di-aplikasi-konmik)

---

## ⚡ Arsitektur & Lingkungan Runtime

Ekstensi KonMik berupa **file JavaScript tunggal (`.js`)** standar ES2020 yang dieksekusi di dalam Flutter menggunakan engine **QuickJS**.

- **Mesin JS**: QuickJS (Ringan, aman dalam *sandbox*, dan sangat responsif).
- **Networking (`fetch`)**: Fungsi `fetch(url, options)` global berbasis asynchronous bridge ke Dart.
  - Mendukung `headers` kustom (`User-Agent`, `Referer`, `Cookie`, dll.).
  - Mendukung method `GET`, `POST`, `PUT`, `DELETE`.
  - Otomatis membypass pembatasan CORS web browser.
- **Isolasi Lingkungan**:
  - ❌ Tidak ada objek `window`, `document`, atau `DOMParser`.
  - ❌ Tidak mendukung modul Node.js (`require()`, `import`, `axios`, `cheerio`).
  - ✅ Parsing HTML dilakukan menggunakan ekspresi reguler murni (**RegExp**) atau manipulasi string.
  - ✅ JSON parsing (`JSON.parse()`, `JSON.stringify()`) didukung penuh.

---

## 📦 Daftar Ekstensi Resmi

| ID | Nama Sumber | Kategori | Bahasa | File Sumber | Tautan Raw GitHub (Langsung Tempel) |
|---|---|---|---|---|---|
| `ext_webtoon_id` | **LINE Webtoon (ID)** | Komik | Indonesia | [webtoon.js](./webtoon.js) | `https://raw.githubusercontent.com/Faaizhamdhy/KonMIk-Extension-/main/webtoon.js` |
| `ext_novel_indowebnovel` | **IndoWebNovel** | Novel | Indonesia | [indowebnovel.js](./indowebnovel.js) | `https://raw.githubusercontent.com/Faaizhamdhy/KonMIk-Extension-/main/indowebnovel.js` |

---

## 🏷️ Format Header Metadata (Wajib)

Setiap file ekstensi **WAJIB** mencantumkan blok metadata di baris paling awal file:

```javascript
// ID: ext_webtoon_id
// NAME: LINE Webtoon (ID)
// TYPE: comic
// VERSION: 1.0.0
// COLOR: #00D564
// ICON: https://webtoons-static.pstatic.net/image/favicon/favicon.ico?dt=2017082301
// REFERER: https://www.webtoons.com/id/
```

### Penjelasan Kunci Metadata:
| Kunci | Wajib | Keterangan | Contoh |
|---|---|---|---|
| `// ID:` | **Ya** | ID unik ekstensi. Wajib diawali `ext_` untuk komik, atau `ext_novel_` untuk novel. | `ext_webtoon_id` atau `ext_novel_indowebnovel` |
| `// NAME:` | **Ya** | Nama sumber yang tampil di antarmuka KonMik. | `LINE Webtoon (ID)` |
| `// TYPE:` | **Ya** | Kategori ekstensi: `comic` (komik/manga/manhwa) atau `novel` (web novel/light novel). | `comic` atau `novel` |
| `// VERSION:` | **Ya** | Versi ekstensi (Semantic Versioning). | `1.0.0` |
| `// COLOR:` | Tidak | Kode warna tema HEX untuk badge dan aksen tombol katalog. | `#00D564` (hijau) / `#00897B` (toska) |
| `// ICON:` | **Ya** | URL langsung favicon/logo situs. | `https://www.google.com/s2/favicons?domain=domain.com&sz=64` |
| `// REFERER:` | Tidak | Nilai default header `Referer` saat memuat gambar halaman/cover. | `https://www.webtoons.com/id/` |

---

## 🎨 Spesifikasi Ekstensi Komik (`type: comic`)

Objek global bernama `var KonmikExtension = { ... }`.  
Untuk komik, Anda **harus mengimplementasikan 3 fungsi utama**:

### 1. `getList(page, query, filters)`
Dipanggil saat membuka katalog komik, explore global, atau pencarian komik.
- **Parameter**:
  - `page` *(number)*: Nomor halaman (dimulai dari `1`).
  - `query` *(string)*: Kata kunci pencarian (string kosong jika melihat katalog).
  - `filters` *(object)*: Filter penyortiran, contoh: `{ sort: 'latest' | 'popular' }`.
- **Return**: `Promise<{ manga_list: Array<ComicItem> }>`

```json
{
  "manga_list": [
    {
      "id": "url-atau-slug-komik",
      "title": "Judul Komik",
      "cover_url": "https://domain.com/cover.jpg",
      "latest_chapter": "Ch. 120",
      "rating": "9.8",
      "views": "1.5M"
    }
  ]
}
```

### 2. `getDetail(slug)`
Dipanggil saat pengguna mengetuk kartu komik untuk melihat detail dan bab.
- **Parameter**: `slug` *(string)*: ID atau path komik dari `ComicItem.id`.
- **Return**: `Promise<ComicDetail>`

```json
{
  "title": "Judul Komik",
  "cover_url": "https://domain.com/cover.jpg",
  "description": "Sinopsis lengkap komik...",
  "author": "Nama Penulis",
  "artist": "Nama Ilustrator",
  "rating": "9.8",
  "views": "1.5M",
  "genres": ["Action", "Fantasy", "Drama"],
  "chapters": [
    {
      "id": "https://domain.com/viewer?title_no=123&episode_no=1",
      "title": "Episode 1",
      "endpoint": "https://domain.com/viewer?title_no=123&episode_no=1",
      "date": "12 Okt 2026"
    }
  ]
}
```

### 3. `getChapterImages(endpoint)`
Dipanggil saat pembaca komik membuka suatu bab.
- **Parameter**: `endpoint` *(string)*: Nilai dari `chapters[i].id` atau `chapters[i].endpoint`.
- **Return**: `Promise<Array<string>>` (Daftar URL gambar halaman berurutan).

---

## 📖 Spesifikasi Ekstensi Novel (`type: novel`)

Objek global bernama `var KonmikExtension = { ... }`.  
Untuk novel, Anda **harus mengimplementasikan 3 fungsi utama**:

### 1. `getList(page, query, filters)`
Dipanggil pada halaman Explore Novel, Katalog Novel Ekstensi, atau pencarian judul novel.
- **Parameter**:
  - `page` *(number)*: Nomor halaman (dimulai dari `1`).
  - `query` *(string)*: Kata kunci pencarian.
  - `filters` *(object)*: Objek filter `{ sort: 'popular' | 'latest' }`.
- **Return**: `Promise<Array<NovelItem>>`

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
- **Parameter**: `slug` *(string)*: Slug atau ID novel.
- **Return**: `Promise<NovelDetail>`

```json
{
  "title": "Judul Novel",
  "cover": "https://domain.com/cover.jpg",
  "synopsis": "Sinopsis novel...",
  "author": "Nama Penulis",
  "type": "Web Novel",
  "status": "Ongoing",
  "genres": ["Action", "Fantasy"],
  "chapters": [
    {
      "id": 1,
      "title": "Chapter 1",
      "slug": "https://domain.com/chapter-1/",
      "date": "July 18, 2026",
      "chapter_number": "Chapter 1"
    }
  ]
}
```
> [!TIP]
> **Urutan Bab Novel**: Array `chapters` diurutkan dari **Bab 1 (tertua) ke Bab Terbaru** agar pembaca dapat membaca secara berurutan.

### 3. `getChapterContent(chapterSlug)`
Dipanggil saat pengguna membuka bab tertentu di Novel Reader.
- **Parameter**: `chapterSlug` *(string)*: URL atau slug bab novel.
- **Return**: `Promise<{ title: string, html: string }>`

```json
{
  "title": "Chapter 1: Awal Perjalanan",
  "html": "<p>Paragraf pertama...</p><p>Paragraf kedua...</p><img src=\"https://domain.com/peta.jpg\" /><p>Paragraf ketiga...</p>"
}
```

---

## 🖼️ Dukungan Ilustrasi Gambar di Novel

KonMik memiliki dukungan khusus untuk **ilustrasi/gambar di dalam bab novel**!

Jika suatu bab mengandung gambar (misalnya ilustrasi karakter, monster, peta dunia, atau sampul bab):
1. Cukup sertakan tag `<img>` di dalam string `html` yang dikembalikan oleh `getChapterContent()`.  
   Contoh: `<p>Muncullah naga hitam:</p><img src="https://domain.com/dragon.jpg" /><p>Pertarungan pun dimulai...</p>`
2. **Mesin Pembaca KonMik akan otomatis**:
   - Mengekstrak gambar menjadi blok visual mandiri (`NovelContentBlock(type: 'image')`).
   - Menyediakan tampilan kartu estetis, caching offline, dan modal interaktif **Pinch-to-Zoom** saat gambar diketuk.
   - Bekerja mulus baik pada mode baca gulir (*scroll*) maupun mode balik halaman (*page-flip*).

---

## 💻 Contoh Kode Ekstensi Lengkap Siap Pakai

### 🎨 1. Contoh Ekstensi Komik: `webtoon.js`
Ekstensi resmi untuk membaca komik dari **LINE Webtoon Indonesia**:

```javascript
// ID: ext_webtoon_id
// NAME: LINE Webtoon (ID)
// TYPE: comic
// VERSION: 1.0.0
// COLOR: #00D564
// ICON: https://webtoons-static.pstatic.net/image/favicon/favicon.ico?dt=2017082301
// REFERER: https://www.webtoons.com/id/

const BASE = 'https://www.webtoons.com/id';
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    'Referer': 'https://www.webtoons.com/id/',
};

async function fetchHtml(url) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
}

function extractMatch(regex, str, defaultVal = '') {
    const m = str.match(regex);
    return m ? m[1].trim() : defaultVal;
}

function extractAll(regex, str) {
    const matches = [];
    let m;
    while ((m = regex.exec(str)) !== null) {
        matches.push(m);
    }
    return matches;
}

var KonmikExtension = {
    async getList(page, query, filters) {
        if (page > 1) return { manga_list: [] };
        
        let url = query 
            ? `${BASE}/search?keyword=${encodeURIComponent(query)}` 
            : `${BASE}/dailySchedule`;
            
        const html = await fetchHtml(url);
        
        const cardRegex = /<a[^>]*href="([^"]+)"[^>]*class="link (?:_card_item|_originals_title_a)"[^>]*data-title-no="(\d+)"[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?<strong[^>]*class="title">([^<]+)<\/strong>/gi;
        
        const mangaList = [];
        const matches = extractAll(cardRegex, html);
        const seen = new Set();
        
        for (const m of matches) {
            const urlPath = m[1];
            const id = m[2];
            let cover = m[3];
            const title = m[4];
            
            if (seen.has(id)) continue;
            seen.add(id);
            
            if (cover.includes('?')) cover = cover.split('?')[0];
            
            mangaList.push({
                id: urlPath,
                title: title.trim(),
                cover_url: cover,
                rating: '10.0',
                views: '-'
            });
        }
        return { manga_list: mangaList };
    },

    async getDetail(urlPath) {
        const html = await fetchHtml(urlPath);
        
        const title = extractMatch(/<h1 class="subj">([^<]+)<\/h1>/i, html, 'Unknown Title');
        const author = extractMatch(/<div class="author_area">[\s\S]*?([^<\n\r\t]+)/i, html, 'Webtoon Creator').trim();
        const desc = extractMatch(/<p class="summary">([\s\S]*?)<\/p>/i, html, 'Tidak ada deskripsi.').replace(/<br>/gi, '\n').trim();
        const genre = extractMatch(/<h2 class="genre">([^<]+)<\/h2>/i, html, 'Webtoon').trim();
        
        let cover = extractMatch(/property="og:image"[\s\S]*?content="([^"]+)"/i, html) || extractMatch(/content="([^"]+)"[\s\S]*?property="og:image"/i, html);
        if (!cover) cover = extractMatch(/<span class="thmb"><img src="([^"]+)"/i, html);
        if (cover.includes('?')) cover = cover.split('?')[0];
        
        const chapterRegex = /<li class="_episodeItem[^>]*data-episode-no="(\d+)"[\s\S]*?<a href="([^"]+)"[\s\S]*?<img src="([^"]+)"[\s\S]*?<span class="subj"><span>([^<]+)<\/span>[\s\S]*?<span class="date">([^<]+)<\/span>/g;
        const matches = extractAll(chapterRegex, html);
        const exactChapters = new Map();
        let maxEp = 0;
        
        for (const m of matches) {
            const epNo = parseInt(m[1]);
            if (epNo > maxEp) maxEp = epNo;
            exactChapters.set(epNo, {
                id: m[2],
                title: m[4].trim(),
                date: m[5].trim()
            });
        }
        
        const chapters = [];
        const baseViewerUrl = urlPath.replace('/list?', '/ep-1/viewer?');
        
        for (let i = maxEp; i >= 1; i--) {
            if (exactChapters.has(i)) {
                chapters.push(exactChapters.get(i)); 
            } else {
                chapters.push({
                    id: baseViewerUrl + '&episode_no=' + i,
                    title: 'Episode ' + i, 
                    date: '-'
                });
            }
        }
        
        chapters.sort((a, b) => {
            const numA = parseInt(extractMatch(/episode_no=(\d+)/, a.id) || 0);
            const numB = parseInt(extractMatch(/episode_no=(\d+)/, b.id) || 0);
            return numB - numA;
        });
        
        return {
            title: title,
            cover_url: cover,
            description: desc,
            rating: '10.0',
            views: '-',
            genres: [genre],
            author: author || 'Kreator',
            artist: author || 'Kreator',
            chapters: chapters
        };
    },

    async getChapterImages(viewerUrl) {
        const html = await fetchHtml(viewerUrl);
        const listHtml = extractMatch(/<div class="viewer_img _img_viewer_area[^>]*id="_imageList">([\s\S]*?)<\/div>/i, html);
        
        const imgRegex = /data-url="([^"]+)"/g;
        const matches = extractAll(imgRegex, listHtml);
        
        const images = [];
        for (const m of matches) {
            images.push(m[1]);
        }
        return images;
    }
};
```

---

### 📖 2. Contoh Ekstensi Novel: `indowebnovel.js`
Ekstensi resmi untuk membaca web novel dan light novel dari **IndoWebNovel**:

```javascript
// ID: ext_novel_indowebnovel
// NAME: IndoWebNovel
// TYPE: novel
// VERSION: 1.0.1
// COLOR: #00897B
// ICON: https://www.google.com/s2/favicons?domain=indowebnovel.id&sz=64
// REFERER: https://indowebnovel.id/

var KonmikExtension = {
  baseUrl: "https://indowebnovel.id",

  async getList(page, query, filters) {
    page = page || 1;
    let url = "";
    if (query && query.trim().length > 0) {
      const q = encodeURIComponent(query.trim());
      url = page > 1 
        ? `${this.baseUrl}/page/${page}/?s=${q}`
        : `${this.baseUrl}/?s=${q}`;
    } else {
      const sort = filters && filters.sort ? filters.sort : "popular";
      if (sort === "popular") {
        url = `${this.baseUrl}/advanced-search/page/${page}/?title=&author=&yearx=&status=&type=&order=popular&country%5B%5D=china&country%5B%5D=jepang&country%5B%5D=korea&country%5B%5D=unknown`;
      } else {
        url = page > 1 ? `${this.baseUrl}/page/${page}/` : `${this.baseUrl}/page/1/`;
      }
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        "Referer": this.baseUrl + "/"
      }
    });
    const html = await res.text();

    const novels = [];
    const seen = {};

    const itemRegex = /<div[^>]+class=['"]flexbox\d?-item['"][\s\S]*?<a[^>]+href=['"](https:\/\/indowebnovel\.id\/series\/([^"'\/]+)\/?)['"][^>]*>[\s\S]*?<img[^>]+(?:data-src|src)=['"]([^'"]+)['"][\s\S]*?<\/div>/gi;
    let match;
    while ((match = itemRegex.exec(html)) !== null) {
      const slug = match[2];
      let cover = match[3];
      if (cover && cover.startsWith("data:image")) {
        const block = match[0];
        const dataSrcMatch = block.match(/data-src=['"]([^'"]+)['"]/i);
        if (dataSrcMatch) cover = dataSrcMatch[1];
      }

      const block = match[0];
      let title = "";
      const titleAttrMatch = block.match(/title=['"]([^'"]+)['"]/i);
      if (titleAttrMatch && titleAttrMatch[1].trim()) {
        title = titleAttrMatch[1].trim();
      } else {
        const textTitleMatch = block.match(/class=['"](?:flexbox\d?-)?title['"][^>]*>[\s\S]*?(?:<a[^>]*>)?([^<]+)/i);
        if (textTitleMatch) title = textTitleMatch[1].trim();
      }
      if (!title) title = slug.replace(/-/g, ' ');

      if (slug && !seen[slug]) {
        seen[slug] = true;
        novels.push({
          id: slug,
          slug: slug,
          title: this._cleanText(title),
          cover: cover,
          source: "ext_novel_indowebnovel",
          type: "Web Novel",
          status: "Ongoing"
        });
      }
    }

    return novels;
  },

  async getDetail(slug) {
    if (slug.startsWith("ext_novel_indowebnovel_")) {
      slug = slug.substring("ext_novel_indowebnovel_".length);
    }
    const url = slug.startsWith("http") ? slug : `${this.baseUrl}/series/${slug}/`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        "Referer": this.baseUrl + "/"
      }
    });
    const html = await res.text();

    let title = "";
    const titleMatch = html.match(/<h[12][^>]*class=['"][^'"]*text-uppercase[^'"]*['"][^>]*>([\s\S]*?)<\/h[12]>/i) ||
                       html.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
    if (titleMatch) title = this._cleanText(titleMatch[1]);
    if (!title) title = slug.replace(/-/g, ' ');

    let cover = "";
    const thumbBlockMatch = html.match(/class=['"](?:series-thumb|thumb)['"][^>]*>([\s\S]*?)<\/div>/i);
    if (thumbBlockMatch) {
      const imgMatch = thumbBlockMatch[1].match(/(?:data-src|src)=['"]([^'"]+)['"]/i);
      if (imgMatch) cover = imgMatch[1];
    }

    let synopsis = "";
    const synopMatch = html.match(/class=['"]series-synops['"][^>]*>([\s\S]*?)<\/div>/i) ||
                       html.match(/class=['"]series-synopsis['"][^>]*>([\s\S]*?)<\/div>/i);
    if (synopMatch) {
      synopsis = this._cleanText(synopMatch[1]);
    }

    const genres = [];
    const genreRegex = /<a[^>]+href=['"]https:\/\/indowebnovel\.id\/genre\/[^'"]+['"][^>]*>([^<]+)<\/a>/gi;
    let gMatch;
    while ((gMatch = genreRegex.exec(html)) !== null) {
      const g = this._cleanText(gMatch[1]);
      if (g && !genres.includes(g)) genres.push(g);
    }
    if (genres.length === 0) genres.push("Web Novel");

    let status = "Ongoing";
    let type = "Web Novel";
    let author = "";
    const statusMatch = html.match(/Status[\s\S]*?<[^>]*>([^<]+)<\/[^>]*>/i);
    if (statusMatch) status = this._cleanText(statusMatch[1]);
    const typeMatch = html.match(/Type[\s\S]*?<[^>]*>([^<]+)<\/[^>]*>/i);
    if (typeMatch) type = this._cleanText(typeMatch[1]);
    const authorMatch = html.match(/Author[\s\S]*?<[^>]*>([^<]+)<\/[^>]*>/i);
    if (authorMatch) author = this._cleanText(authorMatch[1]);

    const chapters = [];
    const chSeen = {};
    const chRegex = /<div class=['"]flexch-infoz['"]>[\s\S]*?<a[^>]+href=['"](https:\/\/indowebnovel\.id\/([^"'\/]+)\/?)['"][^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:<span class=['"]date['"]>([^<]*)<\/span>)?/gi;
    let chMatch;
    let idx = 1;
    while ((chMatch = chRegex.exec(html)) !== null) {
      const chUrl = chMatch[1];
      const chSlug = chMatch[2] || chUrl.replace("https://indowebnovel.id/", "").replace(/\//g, "");
      let rawTitle = chMatch[3] ? this._cleanText(chMatch[3]) : `Chapter ${idx}`;
      let chDate = chMatch[4] ? this._cleanText(chMatch[4]) : "";

      if (chUrl && !chSeen[chUrl]) {
        chSeen[chUrl] = true;
        chapters.push({
          id: idx++,
          title: rawTitle,
          slug: chUrl,
          date: chDate,
          chapter_number: this._extractChapterNumber(rawTitle)
        });
      }
    }

    chapters.reverse();

    return {
      title: title,
      cover: cover,
      synopsis: synopsis,
      genres: genres,
      status: status,
      type: type,
      author: author,
      chapters: chapters
    };
  },

  async getChapterContent(chapterSlug) {
    const url = chapterSlug.startsWith("http") ? chapterSlug : `${this.baseUrl}/${chapterSlug}/`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        "Referer": this.baseUrl + "/"
      }
    });
    const html = await res.text();

    let title = "";
    const titleMatch = html.match(/<h[12][^>]*class=['"][^'"]*title[^'"]*['"][^>]*>([\s\S]*?)<\/h[12]>/i) ||
                       html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (titleMatch) title = this._cleanText(titleMatch[1]);

    let contentHtml = "";
    const startMatch = html.match(/<div[^>]+id=['"]content['"][^>]*>/i);
    if (startMatch) {
      const startIdx = startMatch.index + startMatch[0].length;
      const sub = html.substring(startIdx);
      const endMatch = sub.match(/<div[^>]+class=['"](?:wpd-comment|bottom|nav-links|comments)/i);
      contentHtml = endMatch ? sub.substring(0, endMatch.index) : sub.substring(0, sub.indexOf('</div>'));
    } else {
      const epMatch = html.match(/class=['"]epcontent['"][^>]*>([\s\S]*?)<\/div>/i);
      if (epMatch) contentHtml = epMatch[1];
    }

    contentHtml = contentHtml.replace(/<script[\s\S]*?<\/script>/gi, '');
    contentHtml = contentHtml.replace(/<style[\s\S]*?<\/style>/gi, '');
    contentHtml = contentHtml.replace(/<div class=['"]social-share['"][\s\S]*?<\/div>/gi, '');
    contentHtml = contentHtml.replace(/<div class=['"]comment single['"][\s\S]*$/gi, '');

    return {
      title: title,
      html: contentHtml
    };
  },

  _cleanText(str) {
    if (!str) return "";
    return str
      .replace(/<[^>]+>/g, " ")
      .replace(/&#8211;/g, "–")
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  },

  _extractChapterNumber(title) {
    const m = title.match(/Chapter\s+(\d+(?:\.\d+)?)/i) || title.match(/Bab\s+(\d+(?:\.\d+)?)/i) || title.match(/(\d+(?:\.\d+)?)/);
    return m ? `Chapter ${m[1]}` : title;
  }
};
```

---

## 🤖 Panduan Khusus untuk AI Agent (Prompting Guide)

Jika Anda ingin meminta AI Agent (seperti Claude, ChatGPT, Gemini, atau Antigravity) untuk membuatkan ekstensi baru dari situs komik atau novel tertentu, Anda dapat menyalin prompt di bawah:

### 💬 Contoh Template Prompt untuk AI Agent:

> *"Tolong buatkan file ekstensi JavaScript tunggal untuk aplikasi **KonMik** dari situs `https://target-situs.com`.*  
> *Ketentuan wajib:*
> 1. *Target tipe: `[comic / novel]`.*
> 2. *Tulis metadata header lengkap (`ID`, `NAME`, `TYPE`, `VERSION`, `COLOR`, `ICON`, `REFERER`).*
> 3. *Ekspos objek `var KonmikExtension = { getList, getDetail, [getChapterImages / getChapterContent] }`.*
> 4. *Gunakan hanya JavaScript ES2020 standar (QuickJS), fungsi `fetch()`, dan parsing HTML via **RegExp / String Manipulation** murni.*
> 5. *Jangan gunakan `cheerio`, `axios`, `require()`, atau objek `document/window`.*
> 6. *Untuk novel, pastikan gambar/ilustrasi di dalam teks bab tetap berada di dalam tag `<img>` pada output `html`.*
> 7. *Urutan bab harus terurut dari Bab 1 / Bab paling awal.*"

---

## 🚀 Cara Memasang Ekstensi di Aplikasi KonMik

Karena repositori ini bersifat publik, Anda dapat langsung memasang ekstensi menggunakan **URL Raw GitHub** resmi dari repositori ini:

### 📖 1. Pemasangan Ekstensi Novel:
1. **Salin URL Raw Ekstensi**:
   ```text
   https://raw.githubusercontent.com/Faaizhamdhy/KonMIk-Extension-/main/indowebnovel.js
   ```
2. Buka aplikasi **KonMik** ➡️ Tab **Explore Novel**.
3. Ketuk ikon **Pengaturan Sumber** di pojok kanan atas AppBar.
4. Pada bagian **Ekstensi Novel**, ketuk **Pasang via URL** (atau **+ Pasang Baru**).
5. Tempel URL di atas ➡️ Ketuk **Instal**.

---

### 🎨 2. Pemasangan Ekstensi Komik:
1. **Salin URL Raw Ekstensi**:
   ```text
   https://raw.githubusercontent.com/Faaizhamdhy/KonMIk-Extension-/main/webtoon.js
   ```
2. Buka aplikasi **KonMik** ➡️ Masuk menu **Explore Komik** atau **Profile** ➡️ **Source Settings**.
3. Pada bagian **Ekstensi Komunitas**, ketuk **Pasang via URL** (atau `+`).
4. Tempel URL di atas ➡️ Ketuk **Instal**.

---

## 🤝 Kontribusi
Punya ekstensi baru yang ingin dibagikan?  
Buat *Pull Request* ke repositori [KonMIk-Extension-](https://github.com/Faaizhamdhy/KonMIk-Extension-) atau buat Issue baru dengan melampirkan file skrip ekstensi Anda!
