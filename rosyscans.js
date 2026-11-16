// ID: ext_rosyscans
// NAME: Rosyscans (ID)
// TYPE: comic
// VERSION: 1.0.0
// COLOR: #DD0097
// ICON: https://www.google.com/s2/favicons?domain=rosyscans.com&sz=64
// REFERER: https://rosyscans.com/

/**
 * Ekstensi KonMik untuk Rosyscans (https://rosyscans.com/)
 * Sumber komik & manhwa terjemahan bahasa Indonesia berbasis MangaThemesia / MangaReader.
 */

const BASE = 'https://rosyscans.com';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': `${BASE}/`,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

async function fetchHtml(url) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
}

function cleanText(str) {
    if (!str) return '';
    return str
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#8211;/g, '–')
        .replace(/&#8217;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
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
    /**
     * Mengambil daftar komik dari katalog atau pencarian.
     */
    async getList(page = 1, query = '', filters = {}) {
        let url = `${BASE}/manga/?`;
        const params = [];

        if (query && query.trim()) {
            params.push(`title=${encodeURIComponent(query.trim())}`);
        } else if (filters && filters.sort === 'popular') {
            params.push('order=popular');
        } else if (filters && filters.sort === 'latest') {
            params.push('order=update');
        }

        if (page && page > 1) {
            params.push(`page=${page}`);
        }

        url += params.join('&');
        const html = await fetchHtml(url);

        const cardBlocks = html.match(/<div class=[\'"]bsx[\'"]>[\s\S]*?<\/a>\s*<\/div>/gi) || [];
        const mangaList = [];
        const seen = new Set();

        for (const block of cardBlocks) {
            const slug = extractMatch(/<a[^>]+href=[\'"]https?:\/\/rosyscans\.com\/manga\/([^\/\'"]+)\/?[\'"]/i, block);
            if (!slug || seen.has(slug)) continue;
            seen.add(slug);

            let cover = extractMatch(/<img[^>]+(?:data-src|src)=[\'"]([^\'"]+)[\'"]/i, block);
            if (cover && cover.startsWith('//')) {
                cover = 'https:' + cover;
            }

            const title = cleanText(
                extractMatch(/<div class=[\'"]tt[\'"]>([\s\S]*?)<\/div>/i, block) ||
                extractMatch(/title=[\'"]([^\'"]+)[\'"]/i, block)
            );
            const chapter = cleanText(extractMatch(/<div class=[\'"]epxs[\'"]>([\s\S]*?)<\/div>/i, block));
            const rating = cleanText(extractMatch(/<div class=[\'"]numscore[\'"]>([\s\S]*?)<\/div>/i, block) || '0');

            mangaList.push({
                id: slug,
                title: title || 'Untitled',
                cover_url: cover,
                latest_chapter: chapter,
                rating: rating || '0',
                views: '-'
            });
        }

        return { manga_list: mangaList };
    },

    /**
     * Mengambil info detail komik dan daftar chapter.
     */
    async getDetail(slug) {
        const url = slug.startsWith('http') ? slug : `${BASE}/manga/${slug}/`;
        const html = await fetchHtml(url);

        const title = cleanText(
            extractMatch(/<h1[^>]*class=[\'"][^\'"]*entry-title[^\'"]*[\'"][^>]*>([\s\S]*?)<\/h1>/i, html, '') ||
            extractMatch(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html, 'Untitled')
        );

        let cover = extractMatch(/<div class=[\'"]thumb[\'"][^>]*>[\s\S]*?<img[^>]+(?:data-src|src)=[\'"]([^\'"]+)[\'"]/i, html, '');
        if (!cover) {
            cover = extractMatch(/property=[\'"]og:image[\'"][^>]+content=[\'"]([^\'"]+)[\'"]/i, html, '');
        }
        if (cover && cover.startsWith('//')) {
            cover = 'https:' + cover;
        }

        const rawDesc = extractMatch(/<div class=[\'"]entry-content[^\'"]*[\'"][^>]*>([\s\S]*?)<\/div>/i, html, '');
        const desc = rawDesc ? cleanText(rawDesc.replace(/<\/p>/gi, '\n\n')) : 'Tidak ada deskripsi.';

        const author = cleanText(
            extractMatch(/<b>Author:?<\/b>\s*<span>([^<]+)<\/span>/i, html, '') ||
            extractMatch(/Author:?\s*<span[^>]*>([^<]+)<\/span>/i, html, '') ||
            extractMatch(/<b>Author:?<\/b>\s*([^<]+)</i, html, 'Unknown')
        );

        const artist = cleanText(
            extractMatch(/<b>Artist:?<\/b>\s*<span>([^<]+)<\/span>/i, html, '') ||
            extractMatch(/Artist:?\s*<span[^>]*>([^<]+)<\/span>/i, html, '') ||
            extractMatch(/<b>Artist:?<\/b>\s*([^<]+)</i, html, author)
        );

        const rating = cleanText(
            extractMatch(/<div class=[\'"]numscore[\'"]>([^<]+)<\/div>/i, html, '') ||
            extractMatch(/itemprop=[\'"]ratingValue[\'"][^>]*>([^<]+)</i, html, '0')
        );

        // Daftar Genre
        const genreRegex = /<a[^>]+href=[\'"]https?:\/\/rosyscans\.com\/genres\/[^\'"]+[\'"][^>]*>([^<]+)<\/a>/gi;
        const genreMatches = extractAll(genreRegex, html);
        const genres = [...new Set(genreMatches.map(g => cleanText(g[1])))];

        // Daftar Chapter
        const chapterRegex = /<li[^>]*data-num=[\'"]([^\'"]*)[\'"][\s\S]*?<a[^>]+href=[\'"]([^\'"]+)[\'"][^>]*>[\s\S]*?<span class=[\'"]chapternum[\'"]>([\s\S]*?)<\/span>[\s\S]*?<span class=[\'"]chapterdate[\'"]>([\s\S]*?)<\/span>/gi;
        let chapterMatches = extractAll(chapterRegex, html);

        // Fallback jika tag <li> tidak menggunakan atribut data-num
        if (chapterMatches.length === 0) {
            const fallbackRegex = /<div class=[\'"]eph-num[\'"]>[\s\S]*?<a[^>]+href=[\'"]([^\'"]+)[\'"][^>]*>[\s\S]*?<span class=[\'"]chapternum[\'"]>([\s\S]*?)<\/span>[\s\S]*?<span class=[\'"]chapterdate[\'"]>([\s\S]*?)<\/span>/gi;
            chapterMatches = extractAll(fallbackRegex, html).map(m => ['', m[1], m[2], m[3]]);
        }

        const chapters = chapterMatches.map(m => {
            const chUrl = m[2];
            const chTitle = cleanText(m[3] || `Chapter ${m[1]}`);
            const chDate = cleanText(m[4] || '-');

            return {
                id: chUrl,
                title: chTitle,
                endpoint: chUrl,
                date: chDate
            };
        });

        return {
            title: title,
            cover_url: cover,
            description: desc,
            author: author,
            artist: artist,
            rating: rating || '0',
            views: '-',
            genres: genres,
            chapters: chapters
        };
    },

    /**
     * Mengambil daftar URL gambar halaman dari suatu bab komik.
     */
    async getChapterImages(endpoint) {
        const url = endpoint.startsWith('http') ? endpoint : `${BASE}/${endpoint}`;
        const html = await fetchHtml(url);

        // 1. Coba ambil dari konfigurasi ts_reader.run(...)
        const tsMatch = html.match(/ts_reader\.run\((\{[\s\S]*?\})\);/);
        if (tsMatch) {
            try {
                const tsData = JSON.parse(tsMatch[1]);
                if (tsData && Array.isArray(tsData.sources) && tsData.sources.length > 0) {
                    const images = tsData.sources[0].images;
                    if (Array.isArray(images) && images.length > 0) {
                        return images.map(img => {
                            if (img.startsWith('//')) return 'https:' + img;
                            return img;
                        });
                    }
                }
            } catch (e) {
                // Lanjut ke metode fallback jika JSON parse gagal
            }
        }

        // 2. Fallback: Parse elemen <img> di dalam #readerarea
        const readerMatch = html.match(/<div[^>]+id=[\'"]readerarea[\'"][^>]*>([\s\S]*?)<\/div>/i);
        if (readerMatch) {
            const imgRegex = /<img[^>]+(?:data-src|src)=[\'"]([^\'"]+)[\'"]/gi;
            const imgMatches = extractAll(imgRegex, readerMatch[1]);
            const imgs = imgMatches.map(m => m[1].startsWith('//') ? 'https:' + m[1] : m[1]);
            if (imgs.length > 0) {
                return imgs;
            }
        }

        return [];
    }
};
