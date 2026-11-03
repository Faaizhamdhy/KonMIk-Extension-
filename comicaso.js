// ID: ext_comicaso
// NAME: Comicaso (ID)
// TYPE: comic
// VERSION: 1.0.0
// COLOR: #0f1115
// ICON: https://v3.comicaso.pro/icons/icon-192.png
// REFERER: https://v3.comicaso.pro/

/**
 * Comicaso Extension for KonMik
 * Source: https://v3.comicaso.pro
 * API: https://api.comicaso.pro (proxied via v3.comicaso.pro/api/)
 *
 * Challenge mechanism: Comicaso uses a slider CAPTCHA to gate manga.php / chapter.php.
 * We solve it by simulating a realistic slider drag via POST /api/challenge.php.
 * The verified session cookie (comicaso_human) is stored by the HTTP client and
 * reused automatically for subsequent requests within the same session.
 */

var KonmikExtension = (function () {
  var BASE = "https://v3.comicaso.pro/api";
  var SOURCE = "comicazen";
  var _challengeSolved = false;

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function buildUrl(path, params) {
    var url = BASE + path + "?";
    var parts = [];
    for (var k in params) {
      if (params[k] !== null && params[k] !== undefined && params[k] !== "") {
        parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
      }
    }
    return url + parts.join("&");
  }

  async function apiFetch(url, opts) {
    opts = opts || {};
    var fetchOpts = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "Referer": "https://v3.comicaso.pro/",
        "Accept": "application/json, */*",
      },
      credentials: "include",
    };
    if (opts.method) fetchOpts.method = opts.method;
    if (opts.body) {
      fetchOpts.body = opts.body;
      fetchOpts.headers["Content-Type"] = "application/json";
    }
    var res = await fetch(url, fetchOpts);
    var text = await res.text();
    var json = JSON.parse(text);
    return json;
  }

  // ─── Challenge Solver ────────────────────────────────────────────────────────

  /**
   * Simulates a realistic human slider drag to pass Comicaso's anti-bot check.
   * Must be called before manga.php / chapter.php.
   */
  async function solveChallenge() {
    if (_challengeSolved) return true;

    // 1. Get a fresh challenge ticket
    var ch;
    try {
      var r = await apiFetch(BASE + "/challenge.php");
      if (!r.ok) return false;
      if (r.verified) { _challengeSolved = true; return true; }
      ch = r.challenge;
    } catch (e) {
      return false;
    }

    // 2. Build realistic slider motion samples
    //    Human drags from x=0 to x=1 over ~1100-1400ms
    //    Samples captured every ~25-55ms (from challenge.js: ≥45ms apart required for addSample)
    var totalMs = 1200;
    var samples = [{ x: 0.0, t: 0 }];
    var t = 0;
    var intervals = [
      28, 32, 38, 42, 45, 48, 50, 52, 48, 46, 44, 42, 40, 38, 36, 35,
      34, 34, 35, 36, 38, 40, 42, 46, 50, 54, 58, 60, 62, 60, 55, 50,
      46, 42, 38, 35, 33, 32, 32, 33, 35, 38, 42, 48
    ];
    // Sigmoid easing for natural feel: slow start, fast middle, slow end
    for (var i = 0; i < intervals.length; i++) {
      t += intervals[i];
      if (t >= totalMs) break;
      var frac = t / totalMs;
      // Sigmoid: f(x) = 1/(1+e^(-10*(x-0.5)))  normalised to [0,1]
      var sig = 1 / (1 + Math.exp(-10 * (frac - 0.5)));
      var lo = 1 / (1 + Math.exp(5));
      var hi = 1 / (1 + Math.exp(-5));
      var x = (sig - lo) / (hi - lo);
      // Tiny realistic noise (±0.003)
      var noise = ((i * 1337 + 42) % 17 - 8) * 0.0004;
      x = Math.max(0, Math.min(0.99, x + noise));
      samples.push({ x: Math.round(x * 10000) / 10000, t: t });
    }
    samples.push({ x: 1.0, t: totalMs });

    // 3. Submit
    try {
      var res = await apiFetch(BASE + "/challenge.php", {
        method: "POST",
        body: JSON.stringify({
          challenge_id: ch.id,
          ticket: ch.ticket,
          elapsed_ms: totalMs,
          progress: 1.0,
          samples: samples,
        }),
      });
      if (res && res.verified) {
        _challengeSolved = true;
        return true;
      }
    } catch (e) {
      // ignore
    }
    return false;
  }

  // ─── Extension API ───────────────────────────────────────────────────────────

  /**
   * getList - Browse or search comics.
   * @param {number} page - 1-based page number
   * @param {string} query - search query (optional)
   * @param {object} filters - { sort: "latest" | "popular" }
   * @returns {{ manga_list: Array }}
   */
  async function getList(page, query, filters) {
    var limit = 20;
    var offset = ((page || 1) - 1) * limit;
    var sort = (filters && filters.sort) || "latest";
    var mode = sort === "popular" ? "popular" : "update";

    var url = buildUrl("/home.php", {
      source: SOURCE,
      q: query || "",
      mode: mode,
      type: "all",
      limit: limit,
      offset: offset,
    });

    var json = await apiFetch(url);
    var items = json.data || [];

    return {
      manga_list: items.map(function (item) {
        return {
          id: item.slug || "",
          title: item.title || "",
          cover_url: item.thumbnail || item.cover || "",
          latest_chapter: item.latest_chapter
            ? String(item.latest_chapter)
            : "",
          rating: item.rating ? String(item.rating) : "",
          views: item.views ? String(item.views) : "",
        };
      }),
    };
  }

  /**
   * getDetail - Fetch manga info and chapter list.
   * @param {string} slug - the manga slug
   * @returns {{ title, cover_url, description, author, artist, genres, chapters }}
   */
  async function getDetail(slug) {
    await solveChallenge();

    var url = buildUrl("/manga.php", {
      source: SOURCE,
      slug: slug,
      platform: "web",
    });

    var json = await apiFetch(url);
    if (!json.ok) throw new Error(json.message || "Failed to load manga");

    var m = json.data || {};
    var chapters = (m.chapters || []).map(function (ch) {
      // Encode endpoint as "mangaSlug|chapterSlug|chapterToken"
      var token = ch.chapter_token || "";
      var endpoint = slug + "|" + (ch.slug || "") + "|" + token;
      // Format date from unix timestamp
      var dateStr = "";
      if (ch.date) {
        var d = new Date(ch.date * 1000);
        dateStr =
          d.getDate() +
          "/" +
          (d.getMonth() + 1) +
          "/" +
          d.getFullYear();
      }
      return {
        id: String(ch.id || ch.slug || ""),
        title: ch.title || "",
        endpoint: endpoint,
        date: dateStr,
      };
    });

    // Chapters newest-first (API already returns chronological, so reverse)
    chapters.reverse();

    return {
      title: m.title || "",
      cover_url: m.thumbnail || m.cover || "",
      description: m.synopsis || "",
      author: m.author || "",
      artist: m.artist || "",
      rating: m.rating ? String(m.rating) : "",
      views: m.views ? String(m.views) : "",
      genres: Array.isArray(m.genres) ? m.genres : [],
      chapters: chapters,
    };
  }

  /**
   * getChapterImages - Fetch image URLs for a chapter.
   * @param {string} endpoint - "mangaSlug|chapterSlug|chapterToken"
   * @returns {string[]} array of image URLs
   */
  async function getChapterImages(endpoint) {
    await solveChallenge();

    var parts = String(endpoint).split("|");
    var mangaSlug = parts[0] || "";
    var chapterSlug = parts[1] || "";
    var token = parts[2] || "";

    var params = {
      source: SOURCE,
      manga: mangaSlug,
      chapter: chapterSlug,
      platform: "web",
    };
    if (token) params.token = token;

    var url = buildUrl("/chapter.php", params);
    var json = await apiFetch(url);

    if (!json.ok) throw new Error(json.message || "Failed to load chapter");

    var chData = json.data || {};
    var images = chData.images || [];

    // images is already an array of full CDN URLs
    return images;
  }

  return {
    getList: getList,
    getDetail: getDetail,
    getChapterImages: getChapterImages,
  };
})();
