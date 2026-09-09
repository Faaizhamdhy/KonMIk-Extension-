<div align="center">s
  <img src="https://cdn.phototourl.com/free/2026-09-09-39864e7d-251e-4a86-94c2-b80a8ed91b34.jpg" alt="KonMIk Extensions Logo" width="120" />
  <h1>🚀 Panduan Ekstensi KonMIk</h1>
  <p><i>Cara mudah menambah katalog komik baru tanpa menyentuh kode inti (core) aplikasi!</i></p>
</div>

---

## 🌟 Apa itu Ekstensi KonMIk?

KonMIk mendukung sistem **Ekstensi JavaScript (JS)**. Sistem ini memungkinkan Anda atau komunitas untuk membuat dan memasang sumber bacaan (katalog komik) baru dari berbagai situs, langsung ke dalam aplikasi.
v
Karena berjalan di atas _JavaScript Engine_ (`flutter_qjs`), ekstensi ini **sangat ringan, cepat, dan aman** dibandingkan dengan metode Webview tradisional.

---

## 🛠️ Persyaratan & Struktur Wajib Ekstensi

Agar sebuah kode JS dikenali sebagai ekstensi oleh sistem KonMIk, ada dua hal mutlak yang **wajib** ada di dalam _file_ tersebut:

### 1. Header Metadata (Wajib di Baris Paling Atas)
Aplikasi KonMIk membaca identitas ekstensi dari komentar (header) ini. **Jangan lupakan bagian ini!**

```javascript
// ID: ext_namasource
// NAME: Nama Source
// VERSION: 1.0.0
// COLOR: #WarnaHex
// ICON: https://link-ke-icon.com/icon.png
// REFERER: https://situs-utama.com/
```
💡 **Tips:** Pastikan `ID` diawali dengan awalan `ext_` tanpa menggunakan spasi (contoh: `ext_doujindesu`).

### 2. Objek `KonmikExtension` (Kontrak Wajib)
Di dalam kode Anda, buatlah sebuah konstanta `KonmikExtension` yang berisi 3 buah *fungsi asynchronous*. Ketiga fungsi inilah yang akan dipanggil oleh Flutter untuk meminta data.

```javascript
const KonmikExtension = {
    // 1. Memuat daftar komik di katalog/explore (Mendukung Pencarian & Filter)
    async getList(page, query, filters) { ... },

    // 2. Memuat detail info komik & daftar chapter
    async getDetail(slug) { ... },

    // 3. Memuat gambar saat chapter dibaca
    async getChapterImages(chapterId) { ... }
};
```

---

## 📥 Cara Memasang Ekstensi ke dalam KonMIk

Ada dua cara untuk memasang ekstensi: **Secara Lokal (File)** atau **Secara Online (Tautan Gist)**. Cara kedua sangat disarankan agar ekstensi bisa diperbarui dengan mudah!

### 💻 Cara 1: Menggunakan Tautan (GitHub Gist) — *Direkomendasikan!*
Dengan Gist, Anda bisa membagikan ekstensi ke pengguna lain. Jika sewaktu-waktu situs komik mengubah API mereka, Anda cukup memperbarui Gist tersebut, dan pengguna hanya perlu menekan tombol _refresh_ di KonMIk!

1. Buka [gist.github.com](https://gist.github.com/).
2. Beri nama file (contoh: `doujindesu.js`) dan *paste* seluruh kode ekstensi Anda ke kolom yang tersedia.
3. Klik tombol hijau **Create secret gist** atau **Create public gist**.
4. Di halaman Gist yang sudah jadi, klik tombol **"Raw"**.
5. **⚠️ SANGAT PENTING:** Lihat URL di browser Anda. Hapus serangkaian kode *hash* panjang di tengah URL agar tautannya selalu mengambil versi terbaru.
   * **Salah (Jangan gunakan):** `.../raw/87e4e10e91a569697c449f278a9b49b4/doujindesu.js`
   * **Benar (Gunakan ini):** `.../raw/doujindesu.js`
6. Salin URL "Benar" tersebut.
7. Buka aplikasi KonMIk ➡️ **Profile** ➡️ **Source Settings** ➡️ Klik `+` ➡️ *Paste* URL tersebut dan simpan.

### 📁 Cara 2: Menggunakan File Lokal (`.js`)
1. Simpan kode ekstensi ke dalam file bernama `nama_ekstensi.js` di memori HP Anda.
2. Buka aplikasi KonMIk ➡️ **Profile** ➡️ **Source Settings**.
3. Klik ikon `+` atau **Tambah Source Lokal**.
4. Pilih file `.js` dari HP Anda.
5. Selesai! *(Lakukan Hot Restart pada aplikasi jika icon ekstensi belum muncul).*

---

## 📖 Contoh Source Code Ekstensi (DoujinDesu)

Berikut adalah contoh *source code* utuh yang siap digunakan. Ekstensi ini mengambil data dari API DoujinDesu, memecahkan enkripsi datanya, lalu memetakannya (`mapping`) ke standar yang dipahami oleh KonMIk.

```javascript
// ID: ext_doujindesu
// NAME: DoujinDesu
// VERSION: 1.0.0
// COLOR: #E056CE
// ICON: https://doujin.desu.xxx/favicon.ico
// REFERER: https://doujin.desu.xxx/

const BASE = 'https://doujin.desu.xxx/api';
const APP_SECRET = 'dfdf72051dbfdc7d76889ebd31324e74';
const SALT = 'doujindesu-scrapers-cannot-read-this-super-secret-salt-2026-v2';
const HOUR = 36e5;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

// ==========================================
// 1. FUNGSI DEKRIPSI & KEAMANAN API
// ==========================================

function keyFor(hourBucket) {
    const s = SALT + '_' + hourBucket;
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = (h << 5) - h + s.charCodeAt(i);
        h |= 0;
    }
    let x = Math.abs(h) || 123456789;
    let out = '';
    for (let i = 0; i < 32; i++) {
        x = (x * 1664525 + 1013904223) % 4294967296;
        out += String.fromCharCode(33 + (x % 93));
    }
    return out;
}

function keys() {
    const now = Date.now();
    const b = Math.floor(now / HOUR);
    return [keyFor(b), keyFor(b - 1), keyFor(b + 1)];
}

function xorDecrypt(hex, key) {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        const pair = hex.substring(i, i + 2);
        if (!pair) break;
        bytes.push(parseInt(pair, 16));
    }
    let out = '';
    const klen = key.length;
    let n = 42;
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        out += String.fromCharCode((b ^ key.charCodeAt(i % klen) ^ (i * 13) ^ n) & 255);
        n = (n + b) % 256;
    }
    return out;
}

function decrypt(payload) {
    if (payload && typeof payload === 'object' && typeof payload._enc_resp_ === 'string') {
        for (const k of keys()) {
            try {
                return JSON.parse(decodeURIComponent(xorDecrypt(payload._enc_resp_, k)));
            } catch (e) {}
        }
        throw new Error('Gagal mendekripsi respons API');
    }
    return payload;
}

function deviceId() {
    return 'dev_' + Math.random().toString(36).slice(2, 15) + '_' + Date.now().toString(36);
}

const headers = {
    'User-Agent': USER_AGENT,
    'X-App-Secret': APP_SECRET,
    'x-app-secret': APP_SECRET,
    'x-device-id': deviceId(),
    'Content-Type': 'application/json',
    'Referer': 'https://doujin.desu.xxx/',
    'Origin': 'https://doujin.desu.xxx',
};

// ==========================================
// 2. FUNGSI FETCH BAWAAN
// ==========================================

async function api(path) {
    const res = await fetch(BASE + path, { headers });
    
    const status = res.status || 200;
    if (status !== 200 && status !== 404) {
        throw new Error(`HTTP ${status} untuk ${path}`);
    }
    
    let data = null;
    const text = await res.text();
    try {
        data = decrypt(JSON.parse(text));
    } catch (e) {
        data = text;
    }
    
    if (data && typeof data === 'object' && data.error) {
        throw new Error(`API error: ${data.error}`);
    }
    
    return { data, status: status };
}

// ==========================================
// 3. KONTRAK WAJIB KONMIK EXTENSION
// ==========================================

const KonmikExtension = {
    
    // -- Memuat daftar komik di katalog/explore --
    async getList(page, query, filters) {
        const pageNum = page || 1;
        const limit = 24;
        const offset = (pageNum - 1) * limit;
        
        let url = `/manga?offset=${offset}&limit=${limit}&sort=latest_chapter`;
        if (query) {
            url += `&search=${encodeURIComponent(query)}`;
        }
        
        // Logika Filter
        if (filters) {
            if (filters.genre) {
                let genreSlug = filters.genre.toLowerCase().replace(/\s+/g, '-');
                url += `&genre=${encodeURIComponent(genreSlug)}`;
            }
            if (filters.status) {
                url += `&status=${encodeURIComponent(filters.status.toLowerCase())}`;
            }
            if (filters.type) {
                url += `&type=${encodeURIComponent(filters.type.toLowerCase())}`;
            }
            if (filters.sort) {
                url += `&sort=${encodeURIComponent(filters.sort.toLowerCase())}`;
            }
        }
        
        const res = await api(url);
        
        // Mapping hasil array API doujindesu menjadi array standar KonMIk
        const mangaList = (res.data || []).map(m => ({
            id: m.slug || m.id,            
            title: m.title,                
            cover_url: m.cover_url || '',  
            rating: m.rating ? m.rating.toString() : '0.0', 
            views: m.views ? m.views.toString() : '-'
        }));
        
        return { manga_list: mangaList };
    },

    // -- Memuat detail info komik & daftar chapter --
    async getDetail(slug) {
        const res = await api(`/manga/${slug}`);
        const data = res.data;
        
        // Ambil semua chapter dan urutkan descending (terbaru di atas)
        let rawChapters = data.chapters || [];
        rawChapters.sort((a, b) => b.chapter_number - a.chapter_number);
        
        const chapters = rawChapters.map(c => ({
            id: c.id.toString(),
            title: c.title || `Chapter ${c.chapter_number}`,
            date: c.created_at || ''
        }));
        
        // Map genre menjadi array string
        let genreList = [];
        if (data.manga_genres) {
            genreList = data.manga_genres.map(g => {
                if (typeof g.genres === 'string') return g.genres;
                if (g.genres && g.genres.name) return g.genres.name;
                return "Unknown";
            });
        }

        return {
            title: data.title,
            cover_url: data.cover_url || data.banner_url || '',
            description: data.description || 'Tidak ada deskripsi',
            rating: data.rating ? data.rating.toString() : '0.0',
            views: data.views ? data.views.toString() : '-',
            genres: genreList,
            author: data.author || "?",
            artist: data.artist || "?",
            chapters: chapters
        };
    },

    // -- Memuat gambar saat chapter dibaca --
    async getChapterImages(chapterId) {
        const res = await api(`/chapters/${chapterId}`);
        // Endpoint ini mengembalikan array URL gambar di dalam content_urls
        return res.data.content_urls || [];
    }
};
```

---
*Dibuat dengan ❤️ untuk Komunitas KonMIk.*

## 📝 Lampiran: Contoh Ekstensi Lengkap (LINE Webtoon)

Berikut adalah contoh *source code* ekstensi Javascript lengkap untuk **LINE Webtoon ID**. Ekstensi ini menggunakan beberapa trik scraping HTML ringan menggunakan Regex, fitur penanganan Pagination, dan penarikan gambar langsung.

### `webtoon.js`
```javascript
// ID: ext_webtoon_id
// NAME: LINE Webtoon (ID)
// VERSION: 1.0.0
// COLOR: #00D564
// ICON: https://www.webtoons.com/favicon.ico
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

const KonmikExtension = {
    async getList(page, query, filters) {
        if (page > 1) return { manga_list: [] };
        
        let url = query 
            ? `${BASE}/search?keyword=${encodeURIComponent(query)}` 
            : `${BASE}/dailySchedule`;
            
        const html = await fetchHtml(url);
        
        // BUG FIX: Gunakan <a tag pembuka agar tidak terbalik menangkap href favicon!
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
        
        // Ambil cover bujur sangkar dari og:image
        let cover = extractMatch(/property="og:image"[\s\S]*?content="([^"]+)"/i, html) || extractMatch(/content="([^"]+)"[\s\S]*?property="og:image"/i, html);
        if (!cover) cover = extractMatch(/<span class="thmb"><img src="([^"]+)"/i, html); // Cadangan
        if (cover.includes('?')) cover = cover.split('?')[0];
        
        // 1. Ambil list episode di halaman pertama untuk tahu Episode Terbaru
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
        
        // 2. Generate sisa chapter lama otomatis agar sangat cepat!
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
