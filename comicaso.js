// ID: ext_comicaso
// NAME: Comicaso (ID)
// TYPE: comic
// VERSION: 1.1.0
// COLOR: #0f1115
// ICON: https://v3.comicaso.pro/icons/icon-192.png
// REFERER: https://v3.comicaso.pro/

/**
 * Comicaso Extension for KonMik
 * Source: https://v3.comicaso.pro
 *
 * - home.php  : direct via api.comicaso.pro (no challenge needed)
 * - manga.php / chapter.php : via v3.comicaso.pro/api/ (needs challenge cookie)
 *   Challenge solved by simulating slider drag POST to /api/challenge.php
 */

var KonmikExtension = (function () {
  var API  = "https://api.comicaso.pro";      // direct API (no challenge for home)
  var WEB  = "https://v3.comicaso.pro/api";   // proxied (challenge cookie persists)
  var SOURCE = "comicazen";
  var _challengeSolved = false;

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function qs(params) {
    var parts = [];
    for (var k in params) {
      var v = params[k];
      if (v !== null && v !== undefined && v !== "") {
        parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
      }
    }
    return parts.join("&");
  }

  function safeJson(text) {
    // Strip BOM and leading whitespace/non-printable chars
    var t = text.replace(/^\uFEFF/, "").trim();
    // If starts with < it's HTML → not JSON
    if (t.charAt(0) === "<") {
      throw new Error("Got HTML instead of JSON (len=" + t.length + "): " + t.slice(0, 80));
    }
    return JSON.parse(t);
  }

  var COMMON_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Referer":    "https://v3.comicaso.pro/",
    "Accept":     "application/json, text/plain, */*",
    "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
  };

  async function doGet(url) {
    var res = await fetch(url, { headers: COMMON_HEADERS });
    var text = await res.text();
    return safeJson(text);
  }

  async function doPost(url, bodyObj) {
    var hdrs = {};
    for (var k in COMMON_HEADERS) hdrs[k] = COMMON_HEADERS[k];
    hdrs["Content-Type"] = "application/json";
    var res = await fetch(url, {
      method: "POST",
      headers: hdrs,
      body: JSON.stringify(bodyObj),
    });
    var text = await res.text();
    return safeJson(text);
  }

  // ─── Challenge Solver ─────────────────────────────────────────────────────────

  async function solveChallenge() {
    if (_challengeSolved) return true;

    // 1. Get challenge ticket (via WEB domain so cookie stays on same domain)
    var r;
    try {
      r = await doGet(WEB + "/challenge.php");
    } catch (e) {
      // fallback to direct API domain
      try { r = await doGet(API + "/challenge.php"); } catch (e2) { return false; }
    }

    if (!r || !r.ok) return false;
    if (r.verified) { _challengeSolved = true; return true; }

    var ch = r.challenge;
    if (!ch || !ch.id || !ch.ticket) return false;

    // 2. Build realistic human-like slider samples
    //    Sigmoid motion: slow start → fast middle → slow end
    //    Intervals ~28-62ms to look organic (challenge.js requires >45ms between samples)
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
      var sig = 1 / (1 + Math.exp(-10 * (frac - 0.5)));
      var x = (sig - lo) / (hi - lo);
      // Deterministic micro-noise so it looks human
      var noise = ((i * 1337 + 42) % 17 - 8) * 0.0004;
      x = Math.max(0.001, Math.min(0.99, x + noise));
      samples.push({ x: Math.round(x * 10000) / 10000, t: t });
    }
    samples.push({ x: 1.0, t: totalMs });

    // 3. Submit — must go to same domain as GET to share cookie
    var submitUrl = WEB + "/challenge.php";
    var submitBody = {
      challenge_id: ch.id,
      ticket:       ch.ticket,
      elapsed_ms:   totalMs,
      progress:     1.0,
      samples:      samples,
    };

    try {
      var res = await doPost(submitUrl, submitBody);
      if (res && res.verified) {
        _challengeSolved = true;
        return true;
      }
    } catch (e) {
      // ignore — will proceed without verification (might still work if cookie set)
    }
    return false;
  }

  // ─── Extension API ────────────────────────────────────────────────────────────

  /**
   * getList — Browse or search comics.
   * Uses direct API (no challenge needed for home.php).
   */
  async function getList(page, query, filters) {
    var limit  = 20;
    var offset = ((page || 1) - 1) * limit;
    var sort   = (filters && filters.sort) || "latest";
    var mode   = sort === "popular" ? "popular" : "update";

    // home.php works on direct API without challenge
    var url = API + "/home.php?" + qs({
      source: SOURCE,
      q:      query || "",
      mode:   mode,
      type:   "all",
      limit:  limit,
      offset: offset,
    });

    var json = await doGet(url);
    if (!json || !json.ok) throw new Error("Gagal memuat daftar komik");

    var items = json.data || [];
    return {
      manga_list: items.map(function (item) {
        return {
          id:             item.slug  || "",
          title:          item.title || "",
          cover_url:      item.thumbnail || item.cover || "",
          latest_chapter: item.latest_chapter ? String(item.latest_chapter) : "",
          rating:         item.rating ? String(item.rating) : "",
          views:          item.views  ? String(item.views)  : "",
        };
      }),
    };
  }

  /**
   * getDetail — Manga info + chapter list.
   * Requires challenge cookie; solved automatically.
   */
  async function getDetail(slug) {
    await solveChallenge();

    // Try via WEB proxy first (has challenge cookie), fallback to direct API
    var url = WEB + "/manga.php?" + qs({ source: SOURCE, slug: slug, platform: "web" });
    var json;
    try {
      json = await doGet(url);
    } catch (e) {
      // If WEB fails, try direct API (cookie may have been set cross-domain)
      url = API + "/manga.php?" + qs({ source: SOURCE, slug: slug, platform: "web" });
      json = await doGet(url);
    }

    if (!json || !json.ok) throw new Error(json && json.message ? json.message : "Gagal memuat detail komik");

    var m        = json.data || {};
    var chapters = (m.chapters || []).map(function (ch) {
      var token    = ch.chapter_token || "";
      var endpoint = slug + "|" + (ch.slug || "") + "|" + token;
      var dateStr  = "";
      if (ch.date) {
        var d = new Date(ch.date * 1000);
        dateStr = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
      }
      return {
        id:       String(ch.id || ch.slug || ""),
        title:    ch.title || "",
        endpoint: endpoint,
        date:     dateStr,
      };
    });

    // Newest chapter first
    chapters.reverse();

    return {
      title:       m.title    || "",
      cover_url:   m.thumbnail || m.cover || "",
      description: m.synopsis  || "",
      author:      m.author    || "",
      artist:      m.artist    || "",
      rating:      m.rating    ? String(m.rating) : "",
      views:       m.views     ? String(m.views)  : "",
      genres:      Array.isArray(m.genres) ? m.genres : [],
      chapters:    chapters,
    };
  }

  /**
   * getChapterImages — Page image URLs.
   * endpoint format: "mangaSlug|chapterSlug|chapterToken"
   */
  async function getChapterImages(endpoint) {
    await solveChallenge();

    var parts      = String(endpoint).split("|");
    var mangaSlug  = parts[0] || "";
    var chapterSlug = parts[1] || "";
    var token      = parts[2] || "";

    var params = { source: SOURCE, manga: mangaSlug, chapter: chapterSlug, platform: "web" };
    if (token) params.token = token;

    var url = WEB + "/chapter.php?" + qs(params);
    var json;
    try {
      json = await doGet(url);
    } catch (e) {
      url  = API + "/chapter.php?" + qs(params);
      json = await doGet(url);
    }

    if (!json || !json.ok) throw new Error(json && json.message ? json.message : "Gagal memuat halaman chapter");

    return (json.data && json.data.images) ? json.data.images : [];
  }

  return { getList: getList, getDetail: getDetail, getChapterImages: getChapterImages };
})();
