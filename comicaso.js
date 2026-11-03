// ID: ext_comicaso
// NAME: Comicaso (ID)
// TYPE: comic
// VERSION: 1.3.0
// COLOR: #0f1115
// ICON: https://v3.comicaso.pro/icons/icon-192.png
// REFERER: https://v3.comicaso.pro/

/**
 * Comicaso Extension for KonMik
 * Source: https://v3.comicaso.pro
 * API:    https://api.comicaso.pro
 *
 * QuickJS JSON.parse is strict about control chars inside strings.
 * The API sometimes embeds literal \n/\t inside JSON string values (synopsis etc.).
 * We use fixJson() state-machine to escape them before parsing.
 */

var KonmikExtension = (function () {
  var API    = 'https://api.comicaso.pro';
  var WEB    = 'https://v3.comicaso.pro/api';
  var SOURCE = 'comicazen';
  var _challengeSolved = false;
  var _challengeCookie = '';  // manually carry cookie since QuickJS may not persist cookies

  // ─── JSON Sanitizer ──────────────────────────────────────────────────────────
  // QuickJS strict JSON parser rejects literal control chars inside strings.
  // This state-machine walks the JSON text and escapes them safely.
  function fixJson(text) {
    var out = '';
    var inStr = false;
    var esc = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      var cc = text.charCodeAt(i);

      if (esc) { out += c; esc = false; continue; }
      if (c === '\\') { out += c; esc = true; continue; }
      if (c === '"') { inStr = !inStr; out += c; continue; }

      if (inStr && cc < 32) {
        // Escape control character inside a JSON string value
        if      (cc === 9)  out += '\\t';
        else if (cc === 10) out += '\\n';
        else if (cc === 13) out += '\\r';
        else out += '\\u00' + (cc < 16 ? '0' : '') + cc.toString(16);
        continue;
      }

      out += c;
    }
    return out;
  }

  function safeJsonParse(text) {
    var t = text ? text.replace(/^\uFEFF/, '').trim() : '';
    if (!t) throw new Error('Empty response');
    if (t.charAt(0) === '<') throw new Error('HTML response (len=' + t.length + ')');
    return JSON.parse(fixJson(t));
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function qs(params) {
    var parts = [];
    for (var k in params) {
      var v = params[k];
      if (v !== null && v !== undefined && v !== '') {
        parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
      }
    }
    return parts.join('&');
  }

  function makeHeaders(withCookie) {
    var h = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Referer':    'https://v3.comicaso.pro/',
      'Accept':     'application/json, */*',
    };
    if (withCookie && _challengeCookie) {
      h['Cookie'] = _challengeCookie;
    }
    return h;
  }

  async function doGet(url, withCookie) {
    var res  = await fetch(url, { headers: makeHeaders(withCookie) });
    var text = await res.text();
    return safeJsonParse(text);
  }

  async function doPost(url, bodyObj) {
    var h = makeHeaders(false);
    h['Content-Type'] = 'application/json';
    var res  = await fetch(url, { method: 'POST', headers: h, body: JSON.stringify(bodyObj) });
    var text = await res.text();
    return safeJsonParse(text);
  }

  // ─── Challenge Solver ─────────────────────────────────────────────────────────
  // Comicaso gates manga.php/chapter.php behind a slider CAPTCHA.
  // We simulate a realistic slider drag and read the Set-Cookie header to
  // manually attach the verified session in subsequent requests.
  async function solveChallenge() {
    if (_challengeSolved) return true;

    // 1. Get fresh challenge ticket
    var r;
    try { r = await doGet(WEB + '/challenge.php', false); }
    catch (e) { try { r = await doGet(API + '/challenge.php', false); } catch (e2) { return false; } }

    if (!r || !r.ok) return false;
    if (r.verified) { _challengeSolved = true; return true; }

    var ch = r.challenge;
    if (!ch || !ch.id || !ch.ticket) return false;

    // 2. Build human-like sigmoid slider samples
    var totalMs = 1200;
    var intervals = [
      28, 38, 42, 47, 50, 52, 50, 47, 45, 43, 41, 39, 37, 36, 35,
      34, 34, 35, 36, 38, 40, 43, 46, 50, 54, 58, 60, 62, 60, 55,
      50, 46, 42, 38, 35, 33, 32, 32, 33, 36, 40, 45, 50
    ];
    var lo = 1 / (1 + Math.exp(5));
    var hi = 1 / (1 + Math.exp(-5));
    var samples = [{ x: 0.0, t: 0 }];
    var t = 0;
    for (var i = 0; i < intervals.length; i++) {
      t += intervals[i];
      if (t >= totalMs) break;
      var frac = t / totalMs;
      var sig  = 1 / (1 + Math.exp(-10 * (frac - 0.5)));
      var x    = (sig - lo) / (hi - lo);
      var noise = ((i * 1337 + 42) % 17 - 8) * 0.0004;
      x = Math.max(0.001, Math.min(0.99, x + noise));
      samples.push({ x: Math.round(x * 10000) / 10000, t: t });
    }
    samples.push({ x: 1.0, t: totalMs });

    // 3. Submit challenge
    try {
      var res2 = await doPost(WEB + '/challenge.php', {
        challenge_id: ch.id,
        ticket:       ch.ticket,
        elapsed_ms:   totalMs,
        progress:     1.0,
        samples:      samples,
      });
      if (res2 && res2.verified) {
        _challengeSolved = true;
        return true;
      }
    } catch (e) { /* continue without verified state */ }

    return _challengeSolved;
  }

  // ─── Extension API ────────────────────────────────────────────────────────────

  async function getList(page, query, filters) {
    var limit  = 20;
    var offset = ((page || 1) - 1) * limit;
    var sort   = (filters && filters.sort) || 'latest';
    var mode   = sort === 'popular' ? 'popular' : 'update';

    var url = API + '/home.php?' + qs({
      source: SOURCE,
      q:      query || '',
      mode:   mode,
      type:   'all',
      limit:  limit,
      offset: offset,
    });

    var json  = await doGet(url, false);
    var items = (json && json.data) ? json.data : [];

    return {
      manga_list: items.map(function (item) {
        return {
          id:             item.slug  || '',
          title:          item.title || '',
          cover_url:      item.thumbnail || item.cover || '',
          latest_chapter: item.latest_chapter ? String(item.latest_chapter) : '',
          rating:         item.rating ? String(item.rating) : '',
          views:          item.views  ? String(item.views)  : '',
        };
      }),
    };
  }

  async function getDetail(slug) {
    await solveChallenge();

    var url = WEB + '/manga.php?' + qs({ source: SOURCE, slug: slug, platform: 'web' });
    var json;
    try {
      json = await doGet(url, true);
    } catch (e) {
      url  = API + '/manga.php?' + qs({ source: SOURCE, slug: slug, platform: 'web' });
      json = await doGet(url, true);
    }

    if (!json || !json.ok) throw new Error(json && json.message ? json.message : 'Gagal memuat detail komik');

    var m = json.data || {};
    var chapters = (m.chapters || []).map(function (ch) {
      var token    = ch.chapter_token || '';
      var endpoint = slug + '|' + (ch.slug || '') + '|' + token;
      var dateStr  = '';
      if (ch.date) {
        var d = new Date(ch.date * 1000);
        dateStr = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
      }
      return {
        id:       String(ch.id || ch.slug || ''),
        title:    ch.title || '',
        endpoint: endpoint,
        date:     dateStr,
      };
    });
    chapters.reverse(); // Newest first

    return {
      title:       m.title    || '',
      cover_url:   m.thumbnail || m.cover || '',
      description: m.synopsis  || '',
      author:      m.author    || '',
      artist:      m.artist    || '',
      rating:      m.rating    ? String(m.rating) : '',
      views:       m.views     ? String(m.views)  : '',
      genres:      Array.isArray(m.genres) ? m.genres : [],
      chapters:    chapters,
    };
  }

  async function getChapterImages(endpoint) {
    await solveChallenge();

    var parts       = String(endpoint).split('|');
    var mangaSlug   = parts[0] || '';
    var chapterSlug = parts[1] || '';
    var token       = parts[2] || '';
    var params      = { source: SOURCE, manga: mangaSlug, chapter: chapterSlug, platform: 'web' };
    if (token) params.token = token;

    var url = WEB + '/chapter.php?' + qs(params);
    var json;
    try {
      json = await doGet(url, true);
    } catch (e) {
      url  = API + '/chapter.php?' + qs(params);
      json = await doGet(url, true);
    }

    if (!json || !json.ok) throw new Error(json && json.message ? json.message : 'Gagal memuat halaman chapter');
    return (json.data && json.data.images) ? json.data.images : [];
  }

  return { getList: getList, getDetail: getDetail, getChapterImages: getChapterImages };
})();
