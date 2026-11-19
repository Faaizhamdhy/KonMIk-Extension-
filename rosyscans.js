// ID: ext_rosyscans
// NAME: Rosyscans (ID)
// TYPE: comic
// VERSION: 1.0.3
// COLOR: #DD0097
// ICON: https://rosyscans.com/wp-content/uploads/2026/11/cropped-rosyscans_logo-192x192.png
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
        .replace(/&#038;/g, '&')
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
        } else {
            // Default ke order=update agar selalu menampilkan komik terupdate yang memiliki chapter
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
            // Support fleksibel domain (rosyscans.com / rosyscans.id / relative)
            const slug = extractMatch(/<a[^>]+href=[\'"](?:https?:\/\/[^\/]+)?\/manga\/([^\/\'"]+)\/?[\'"]/i, block);
            if (!slug || seen.has(slug)) continue;

            const chapter = cleanText(extractMatch(/<div class=[\'"]epxs[\'"]>([\s\S]*?)<\/div>/i, block));
            
            // Lewati judul dummy / placeholder yang belum memiliki chapter rilis
            if (chapter.includes('?') || chapter.toLowerCase() === 'chapter') {
                continue;
            }

            seen.add(slug);

            let cover = extractMatch(/<img[^>]+(?:data-src|src)=[\'"]([^\'"]+)[\'"]/i, block);
            if (cover && cover.startsWith('//')) {
                cover = 'https:' + cover;
            }

            const title = cleanText(
                extractMatch(/<div class=[\'"]tt[\'"]>([\s\S]*?)<\/div>/i, block) ||
                extractMatch(/title=[\'"]([^\'"]+)[\'"]/i, block)
            );
            const rating = cleanText(extractMatch(/<div class=[\'"]numscore[\'"]>([\s\S]*?)<\/div>/i, block) || '0');

            mangaList.push({
                id: slug,
                title: title || 'Untitled',
                cover_url: cover,
                latest_chapter: chapter || 'Chapter 1',
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
        let cleanSlug = slug;
        if (cleanSlug.startsWith('http')) {
            const m = cleanSlug.match(/\/manga\/([^\/\'"]+)/i);
            if (m) cleanSlug = m[1];
        }

        const url = cleanSlug.startsWith('http') ? cleanSlug : `${BASE}/manga/${cleanSlug}/`;
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
        const genreRegex = /<a[^>]+href=[\'"](?:https?:\/\/[^\/]+)?\/genres\/[^\'"]+[\'"][^>]*>([^<]+)<\/a>/gi;
        const genreMatches = extractAll(genreRegex, html);
        const genres = [...new Set(genreMatches.map(g => cleanText(g[1])))];

        // Daftar Chapter
        const chapterRegex = /<li[^>]*data-num=[\'"]([^\'"]*)[\'"][\s\S]*?<a[^>]+href=[\'"]([^\'"]+)[\'"][^>]*>[\s\S]*?<span class=[\'"]chapternum[\'"]>([\s\S]*?)<\/span>[\s\S]*?<span class=[\'"]chapterdate[\'"]>([\s\S]*?)<\/span>/gi;
        let chapterMatches = extractAll(chapterRegex, html);

        // Fallback jika format li tanpa data-num
        if (chapterMatches.length === 0) {
            const fallbackRegex = /<div class=[\'"]eph-num[\'"]>[\s\S]*?<a[^>]+href=[\'"]([^\'"]+)[\'"][^>]*>[\s\S]*?<span class=[\'"]chapternum[\'"]>([\s\S]*?)<\/span>[\s\S]*?<span class=[\'"]chapterdate[\'"]>([\s\S]*?)<\/span>/gi;
            chapterMatches = extractAll(fallbackRegex, html).map(m => ['', m[1], m[2], m[3]]);
        }

        // Fallback kedua: cari setiap tag <a> chapter di dalam #chapterlist
        if (chapterMatches.length === 0) {
            const chapterListBlock = extractMatch(/id=[\'"]chapterlist[\'"][^>]*>([\s\S]*?)<\/div>/i, html, '');
            if (chapterListBlock) {
                const simpleChRegex = /<a[^>]+href=[\'"]([^\'"]+)[\'"][^>]*>[\s\S]*?<span class=[\'"]chapternum[\'"]>([\s\S]*?)<\/span>/gi;
                chapterMatches = extractAll(simpleChRegex, chapterListBlock).map(m => ['', m[1], m[2], '-']);
            }
        }

        const chapters = chapterMatches.map(m => {
            let chUrl = m[2];
            if (chUrl && chUrl.startsWith('/')) {
                chUrl = `${BASE}${chUrl}`;
            }
            const chTitle = cleanText(m[3] || `Chapter ${m[1]}`);
            const chDate = cleanText(m[4] || '-');

            return {
                id: chUrl,
                title: chTitle,
                endpoint: chUrl,
                date: chDate
            };
        });

        // Jika komik baru di katalog Rosyscans belum memiliki chapter sama sekali
        if (chapters.length === 0) {
            chapters.push({
                id: 'unreleased',
                title: 'Chapter 0 (Segera Hadir / Belum Ada Bab)',
                endpoint: '',
                date: '-'
            });
        }

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
        if (!endpoint || endpoint === 'unreleased') return [];

        let url = endpoint;
        if (!url.startsWith('http')) {
            url = url.startsWith('/') ? `${BASE}${url}` : `${BASE}/${url}`;
        }

        const html = await fetchHtml(url);

        let rawImages = [];

        // 1. Coba ambil dari konfigurasi ts_reader.run(...)
        const tsMatch = html.match(/ts_reader\.run\((\{[\s\S]*?\})\)/);
        if (tsMatch) {
            try {
                const tsData = JSON.parse(tsMatch[1]);
                if (tsData && Array.isArray(tsData.sources) && tsData.sources.length > 0) {
                    const images = tsData.sources[0].images;
                    if (Array.isArray(images) && images.length > 0) {
                        rawImages = images;
                    }
                }
            } catch (e) {
                // Fallback ke parser HTML jika JSON parse gagal
            }
        }

        // 2. Fallback: Parse elemen <img> di dalam area pembaca (#readerarea)
        if (rawImages.length === 0) {
            const readerIdx = html.indexOf('id="readerarea"');
            const altReaderIdx = readerIdx !== -1 ? readerIdx : html.indexOf("id='readerarea'");
            
            if (altReaderIdx !== -1) {
                const areaSlice = html.substring(altReaderIdx, altReaderIdx + 60000);
                const imgRegex = /<img[^>]+(?:data-src|src)=[\'"]([^\'"]+)[\'"]/gi;
                const imgMatches = extractAll(imgRegex, areaSlice);
                rawImages = imgMatches
                    .map(m => m[1])
                    .filter(u => !u.includes('placeholder') && !u.includes('loading') && (u.includes('.jpg') || u.includes('.png') || u.includes('.webp') || u.includes('/uploads/')));
            }
        }

        if (rawImages.length === 0) return [];

        return rawImages.map(img => {
            let fullImg = img.trim();
            if (fullImg.startsWith('//')) fullImg = 'https:' + fullImg;

            // Alirkan CDN gambar img.rosyscans.id via proxy backend resmi KonMik
            // agar tembus blokir ISP seluler di Indonesia (anti-DNS hanging / IPv6 drop)
            if (fullImg.includes('img.rosyscans.id') || fullImg.includes('rosyscans')) {
                return `https://api.konkon.id/proxy?url=${encodeURIComponent(fullImg)}&referer=https%3A%2F%2Frosyscans.com%2F`;
            }

            return fullImg;
        });
    }
};
