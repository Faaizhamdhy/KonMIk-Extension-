// ID: ext_westmanga
// NAME: Westmanga
// TYPE: comic
// VERSION: 1.0.0
// COLOR: #E53935
// ICON: https://v1.westmanga.my/favicon.ico
// REFERER: https://v1.westmanga.my/

/**
 * Ekstensi KonMik untuk Westmanga (https://v1.westmanga.my/)
 * Mendukung katalog komik terbaru, pencarian, detail komik, daftar chapter, dan gambar reader.
 */

const BASE = 'https://v1.westmanga.my';
let cachedToken = null;
let tokenExpiresAt = 0;

const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': `${BASE}/`,
    'Origin': BASE,
};

async function getVisitToken(forceRefresh = false) {
    const now = Math.floor(Date.now() / 1000);
    if (!forceRefresh && cachedToken && (tokenExpiresAt - now > 300)) {
        return cachedToken;
    }

    try {
        const res = await fetch(`${BASE}/api/visit-token`, {
            headers: defaultHeaders
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && data.token) {
            cachedToken = data.token;
            tokenExpiresAt = Number(data.expires_at) || (now + 3600);
            return cachedToken;
        }
    } catch (e) {
        if (cachedToken) return cachedToken;
        throw e;
    }
    return cachedToken;
}

async function apiFetch(path) {
    let token = await getVisitToken();
    let headers = Object.assign({}, defaultHeaders, {
        'X-WM-Visit': token || ''
    });

    let res = await fetch(`${BASE}${path}`, { headers });
    
    // Jika token kedaluwarsa (401/403), refresh token dan coba sekali lagi
    if ((res.status === 401 || res.status === 403) && token) {
        token = await getVisitToken(true);
        headers['X-WM-Visit'] = token || '';
        res = await fetch(`${BASE}${path}`, { headers });
    }

    if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${path}`);
    }
    return await res.json();
}

function fullUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

var KonmikExtension = {
    /**
     * Mengambil daftar komik (Katalog, Jelajah, atau Pencarian).
     */
    async getList(page = 1, query = '', filters = {}) {
        let endpoint = '/api/contents?';
        const params = [];

        if (query && query.trim()) {
            params.push(`q=${encodeURIComponent(query.trim())}`);
        }
        if (filters && filters.sort === 'popular') {
            params.push('order=popular');
        } else if (filters && filters.sort === 'latest') {
            params.push('order=latest');
        }
        params.push(`page=${page || 1}`);

        endpoint += params.join('&');
        const json = await apiFetch(endpoint);
        const list = (json && Array.isArray(json.data)) ? json.data : [];

        const mangaList = list.map(item => {
            const lastCh = (item.lastChapters && item.lastChapters.length > 0) ? item.lastChapters[0] : null;
            let latestChapter = '';
            if (lastCh) {
                latestChapter = lastCh.number ? `Ch. ${lastCh.number}` : (lastCh.title || '');
            }

            return {
                id: item.slug || String(item.id),
                title: item.title || 'Untitled',
                cover_url: fullUrl(item.cover),
                latest_chapter: latestChapter,
                rating: item.rating ? String(item.rating) : '0',
                views: item.total_views ? String(item.total_views) : '-'
            };
        });

        return { manga_list: mangaList };
    },

    /**
     * Mengambil detail komik beserta daftar seluruh chapter.
     */
    async getDetail(slug) {
        const json = await apiFetch(`/api/comic/${encodeURIComponent(slug)}`);
        const data = (json && json.data) ? json.data : {};

        let genres = [];
        if (Array.isArray(data.genres)) {
            genres = data.genres.map(g => (typeof g === 'object' && g.name) ? g.name : String(g));
        }

        const rawChapters = Array.isArray(data.chapters) ? data.chapters : [];
        const chapters = rawChapters.map(ch => ({
            id: ch.slug || String(ch.id),
            title: ch.number ? `Chapter ${ch.number}` : (ch.title || 'Chapter'),
            endpoint: ch.slug || String(ch.id),
            date: (ch.created_at && ch.created_at.formatted) ? ch.created_at.formatted : '-'
        }));

        return {
            title: data.title || 'Untitled',
            cover_url: fullUrl(data.cover),
            description: data.sinopsis || data.synopsis || data.description || 'Tidak ada deskripsi.',
            author: data.author || 'Unknown',
            artist: data.artist || data.author || 'Unknown',
            rating: data.rating ? String(data.rating) : '0',
            views: data.total_views ? String(data.total_views) : '-',
            genres: genres,
            chapters: chapters
        };
    },

    /**
     * Mengambil seluruh URL gambar pada suatu bab/chapter.
     */
    async getChapterImages(endpoint) {
        const json = await apiFetch(`/api/v/${encodeURIComponent(endpoint)}`);
        const data = (json && json.data) ? json.data : {};
        const images = Array.isArray(data.images) ? data.images : [];

        return images.map(img => fullUrl(img));
    }
};
