// ID: ext_novel_flyinglines
// NAME: Flying Lines (EN)
// TYPE: novel
// VERSION: 1.0.0
// COLOR: #3B82F6
// ICON: https://www.flying-lines.com/favicon.ico
// REFERER: https://www.flying-lines.com/

/**
 * Ekstensi KonMik untuk Flying Lines (https://www.flying-lines.com/)
 * Menyediakan katalog novel, pencarian, metadata buku, daftar bab, dan pembaca bab.
 */

const BASE = 'https://www.flying-lines.com';
const API_KEY = '0b749732c5493f2328eba79ce8c6f8f7';

function md5(string) {
    function rotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    function addUnsigned(lX, lY) {
        var lX4 = (lX & 0x40000000), lY4 = (lY & 0x40000000);
        var lX8 = (lX & 0x80000000), lY8 = (lY & 0x80000000);
        var lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        if (lX4 | lY4) {
            if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        }
        return (lResult ^ lX8 ^ lY8);
    }
    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }
    function FF(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function GG(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function HH(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function II(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function convertToWordArray(string) {
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            var lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        var lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    }
    function wordToHex(lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    }

    var x = convertToWordArray(string);
    var k, AA, BB, CC, DD, a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    for (k = 0; k < x.length; k += 16) {
        AA = a; BB = b; CC = c; DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }
    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

function turnCharIntoString(content, nowTime) {
    if (!content) return "";
    var tStr = String(nowTime);
    var n = parseInt(tStr[tStr.length - 1], 10);
    var a = parseInt(tStr[tStr.length - 2], 10);
    var res = "";
    for (var o = 0; o < content.length; o++) {
        var code = content.charCodeAt(o);
        res += o % 2 === 0 ? String.fromCharCode(code - n) : String.fromCharCode(code - a);
    }
    return res;
}

var KonmikExtension = {
    baseUrl: BASE,

    async getList(page = 1, query = '', filters = {}) {
        page = page || 1;
        var list = [];

        if (query && query.trim().length > 0) {
            var q = encodeURIComponent(query.trim());
            var searchUrl = BASE + '/el/prefix/search?searchContent=' + q + '&pageNo=' + page + '&pageSize=20&novelType=0';
            var res = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Referer': BASE + '/'
                }
            });
            var json = await res.json();
            var items = (json && json.data && Array.isArray(json.data.list)) ? json.data.list : [];

            for (var i = 0; i < items.length; i++) {
                var it = items[i];
                var nid = it.novelId || it.id;
                var slug = it.novelPath || '';
                if (!slug && nid) {
                    try {
                        var pRes = await fetch(BASE + '/noveldetail/getNovelPathByNovelId/' + nid, {
                            headers: { 'User-Agent': 'Mozilla/5.0' }
                        });
                        var pJson = await pRes.json();
                        if (pJson && pJson.data) slug = pJson.data;
                    } catch (_) {}
                }
                list.push({
                    id: slug || String(nid),
                    title: it.novelName || it.searchContent || 'Untitled',
                    cover: it.novelThumb || '',
                    type: 'Web Novel',
                    status: 'Ongoing',
                    author: 'Flying Lines',
                    synopsis: '',
                    genres: ['Web Novel'],
                    latest_chapter: ''
                });
            }
        } else {
            var catUrl = BASE + '/h5/tag/novelByCategory/all/1?novelType=0';
            var res = await fetch(catUrl, {
                method: 'POST',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Referer': BASE + '/genre/all',
                    'Origin': BASE
                },
                body: JSON.stringify({ orderBy: 'DESC', page: page, pageSize: 20 })
            });
            var json = await res.json();
            var novelTOS = (json && json.data && json.data.novelTOS) ? json.data.novelTOS : {};
            var items = Array.isArray(novelTOS.list) ? novelTOS.list : [];

            list = items.map(function(item) {
                var rawDesc = item.description || '';
                var syn = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                var genres = [];
                if (item.tagTOS && Array.isArray(item.tagTOS)) {
                    genres = item.tagTOS.map(function(t) { return t.name; });
                }
                if (genres.length === 0 && item.category) genres = [item.category];
                if (genres.length === 0) genres = ['Web Novel'];

                return {
                    id: item.path || String(item.id),
                    title: item.name || 'Untitled',
                    cover: item.thumb || '',
                    type: 'Web Novel',
                    status: item.status === 1 ? 'Completed' : 'Ongoing',
                    author: item.author || 'Flying Lines',
                    synopsis: syn,
                    genres: genres,
                    latest_chapter: item.latestChapterNumber ? ('Chapter ' + item.latestChapterNumber) : ''
                };
            });
        }

        return list;
    },

    async getDetail(slug) {
        var cleanSlug = slug.replace(/^https?:\/\/[^\/]+\/novel\//i, '').replace(/^\/+|\/+$/g, '');
        var novelId = '';
        var title = '';
        var cover = '';
        var synopsis = '';
        var author = '';
        var genres = [];
        var status = 'Ongoing';

        var pageUrl = BASE + '/novel/' + cleanSlug;
        var res = await fetch(pageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                'Referer': BASE + '/genre/all'
            }
        });
        var html = await res.text();

        var idMatch = html.match(/class=["']novel["'][^>]*data-id=["'](\d+)["']/i) ||
                      html.match(/data-novel(?:_id)?=["'](\d+)["']/i);
        if (idMatch) novelId = idMatch[1];

        var titleMatch = html.match(/<h1[^>]*class=["'][^"']*novel-name[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
                         html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']/i);
        if (titleMatch) title = titleMatch[1].replace(/<[^>]+>/g, '').trim();

        var coverMatch = html.match(/class=["'][^"']*novel-thumb[^"']*["'][\s\S]*?<img[^>]+src=["']([^"']+)["']/i) ||
                         html.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i);
        if (coverMatch) cover = coverMatch[1];

        var descMatch = html.match(/class=["'][^"']*novel-desc[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
                        html.match(/<meta property=["']og:description["'] content=["']([^"']+)["']/i);
        if (descMatch) synopsis = descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

        var genreRegex = /<a[^>]+href=["']\/genre\/[^"']+["'][^>]*>([^<]+)<\/a>/gi;
        var gMatch;
        while ((gMatch = genreRegex.exec(html)) !== null) {
            var g = gMatch[1].trim();
            if (g && genres.indexOf(g) === -1) genres.push(g);
        }
        if (genres.length === 0) genres = ['Web Novel'];

        if (html.indexOf('Completed') !== -1) status = 'Completed';

        var chapters = [];
        if (novelId) {
            var chapUrl = BASE + '/noveldetail/getChaptersByNovelId/' + novelId;
            var cRes = await fetch(chapUrl, {
                method: 'POST',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Referer': pageUrl,
                    'Origin': BASE
                },
                body: JSON.stringify({ orderBy: 'ASC', page: 1, pageSize: 10000 })
            });
            var cJson = await cRes.json();
            var rawList = (cJson && cJson.data && Array.isArray(cJson.data.list)) ? cJson.data.list : [];

            chapters = rawList.map(function(ch) {
                var chNum = ch.chapterNumber || ch.id;
                var chTitle = ch.title ? ('Chapter ' + chNum + ': ' + ch.title) : ('Chapter ' + chNum);
                var isPay = ch.isPayment === 1;
                if (isPay && !ch.unlockStatus) chTitle += ' 🔒';

                var dateStr = '';
                if (ch.publishTime) {
                    try {
                        dateStr = new Date(ch.publishTime).toISOString().split('T')[0];
                    } catch (_) {}
                }

                return {
                    id: chNum,
                    title: chTitle,
                    slug: cleanSlug + '/c-' + chNum,
                    date: dateStr,
                    chapter_number: String(chNum)
                };
            });
        }

        return {
            title: title || cleanSlug,
            cover: cover,
            synopsis: synopsis,
            genres: genres,
            status: status,
            type: 'Web Novel',
            author: author || 'Flying Lines',
            chapters: chapters
        };
    },

    async getChapterContent(chapterSlug) {
        var clean = chapterSlug.replace(/^https?:\/\/[^\/]+\/chapter\//i, '').replace(/^\/+|\/+$/g, '');
        var parts = clean.split('/c-');
        if (parts.length < 2) {
            throw new Error('Format slug chapter tidak valid: ' + chapterSlug);
        }
        var novelPath = parts[0];
        var chapterNum = parts[1].split('-')[0].split('/')[0];

        var t = Date.now();
        var signStr = 'chapterNum=' + chapterNum + '&novelPath=' + novelPath + '&time=' + t + '&webdriver=0&key=' + API_KEY;
        var sign = md5(signStr);

        var url = BASE + '/h5/novel/' + novelPath + '/' + chapterNum + '?accessToken=&isFirstEnter=1&sign=' + sign + '&webdriver=0&time=' + t;
        var res = await fetch(url, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': BASE + '/chapter/' + novelPath + '/c-' + chapterNum,
                'Origin': BASE
            },
            body: ''
        });

        var json = await res.json();
        if (!json || !json.data) {
            throw new Error('Gagal mengambil konten bab dari Flying Lines.');
        }

        var data = json.data;
        var rawContent = data.content || '';
        var nowTime = data.nowTime || t;
        var decryptedHtml = turnCharIntoString(rawContent, nowTime);

        if (!decryptedHtml.includes('<p>') && !decryptedHtml.includes('<div>')) {
            decryptedHtml = decryptedHtml.split('\n').map(function(line) {
                return '<p>' + line.trim() + '</p>';
            }).join('');
        }

        var chTitle = data.title ? ('Chapter ' + (data.currentChapterNumber || chapterNum) + ': ' + data.title) : ('Chapter ' + chapterNum);

        return {
            title: chTitle,
            html: decryptedHtml
        };
    }
};
