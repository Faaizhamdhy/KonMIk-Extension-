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
        
        // Gunakan tag <a pembuka agar tidak terbalik menangkap href favicon
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
        
        // 2. Generate sisa chapter lama otomatis agar sangat cepat
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
