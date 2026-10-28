// ID: ext_novel_indowebnovel
// NAME: IndoWebNovel
// TYPE: novel
// VERSION: 1.0.3
// COLOR: #00897B
// ICON: https://www.google.com/s2/favicons?domain=indowebnovel.id&sz=64
// REFERER: https://indowebnovel.id/

var KonmikExtension = {
  baseUrl: "https://indowebnovel.id",

  // 1. getList(page, query, filters)
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

    // Universal regex mendukung flexbox-item, flexbox2-item, dan flexbox3-item
    const itemRegex = /<div[^>]+class=['"]flexbox\d?-item['"][\s\S]*?<a[^>]+href=['"](https:\/\/indowebnovel\.id\/series\/([^"'\/]+)\/?)['"][^>]*>[\s\S]*?<img[^>]+(?:data-src|src)=['"]([^'"]+)['"][\s\S]*?<\/div>/gi;
    let match;
    while ((match = itemRegex.exec(html)) !== null) {
      const fullUrl = match[1];
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

      // Ambil bab terbaru jika tersedia di card
      let latestChapter = "";
      const chBlockMatch = block.match(/<ul class=['"]chapter['"]>[\s\S]*?<a[^>]+href=['"][^'"]+['"][^>]*>([\s\S]*?)<\/a>/i);
      if (chBlockMatch) {
        latestChapter = this._extractChapterNumber(this._cleanText(chBlockMatch[1]));
      }

      if (slug && !seen[slug]) {
        seen[slug] = true;
        novels.push({
          id: slug,
          slug: slug,
          title: this._cleanText(title),
          cover: cover,
          source: "ext_novel_indowebnovel",
          type: "Web Novel",
          status: "Ongoing",
          latest_chapter: latestChapter || null
        });
      }
    }

    return novels;
  },

  // 2. getDetail(slug)
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

    // 1. Judul & Judul Alternatif
    let title = "";
    const titleMatch = html.match(/<div class=['"]series-titlex['"]>[\s\S]*?<h[12][^>]*>([\s\S]*?)<\/h[12]>/i) ||
                       html.match(/<h[12][^>]*class=['"][^'"]*text-uppercase[^'"]*['"][^>]*>([\s\S]*?)<\/h[12]>/i) ||
                       html.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
    if (titleMatch) title = this._cleanText(titleMatch[1]);
    if (!title) title = slug.replace(/-/g, ' ');

    let altTitle = "";
    const altMatch = html.match(/<div class=['"]series-titlex['"]>[\s\S]*?<span>([\s\S]*?)<\/span>/i);
    if (altMatch) {
      const cleanAlt = this._cleanText(altMatch[1]);
      if (cleanAlt.toLowerCase() !== title.toLowerCase()) {
        altTitle = cleanAlt;
      }
    }

    // 2. Cover
    let cover = "";
    const thumbBlockMatch = html.match(/class=['"](?:series-thumb|thumb)['"][^>]*>([\s\S]*?)<\/div>/i);
    if (thumbBlockMatch) {
      const imgMatch = thumbBlockMatch[1].match(/(?:data-src|src)=['"]([^'"]+)['"]/i);
      if (imgMatch) cover = imgMatch[1];
    }

    // 3. Sinopsis
    let synopsis = "";
    const synopMatch = html.match(/class=['"]series-synops['"][^>]*>([\s\S]*?)<\/div>/i) ||
                       html.match(/class=['"]series-synopsis['"][^>]*>([\s\S]*?)<\/div>/i);
    if (synopMatch) {
      synopsis = this._cleanText(synopMatch[1]);
    }

    // 4. Genre
    const genres = [];
    const genreRegex = /<a[^>]+href=['"]https:\/\/indowebnovel\.id\/genre\/[^'"]+['"][^>]*>([^<]+)<\/a>/gi;
    let gMatch;
    while ((gMatch = genreRegex.exec(html)) !== null) {
      const g = this._cleanText(gMatch[1]);
      if (g && !genres.includes(g)) genres.push(g);
    }
    if (genres.length === 0) genres.push("Web Novel");

    // 5. Status & Tipe & Author (Parsing terarah khusus blok metadata)
    let status = "Ongoing";
    const statusMatch = html.match(/<span[^>]+class=['"]status[^\'"]*['"][^>]*>([\s\S]*?)<\/span>/i) ||
                        html.match(/<b>\s*Status\s*<\/b>\s*<span>([\s\S]*?)<\/span>/i);
    if (statusMatch) status = this._cleanText(statusMatch[1]);

    let type = "Web Novel";
    const typeMatch = html.match(/<span[^>]+class=['"]type[^\'"]*['"][^>]*>([\s\S]*?)<\/span>/i) ||
                      html.match(/<b>\s*Type\s*<\/b>\s*<span>([\s\S]*?)<\/span>/i);
    if (typeMatch) {
      const cleanT = this._cleanText(typeMatch[1]);
      if (cleanT.length <= 25) type = cleanT;
    }

    let author = "";
    const authorMatch = html.match(/<li>\s*<b>\s*Author\s*<\/b>\s*<span>([\s\S]*?)<\/span>\s*<\/li>/i) ||
                        html.match(/<b>\s*Author\s*<\/b>\s*<span>([\s\S]*?)<\/span>/i);
    if (authorMatch) {
      const cleanA = this._cleanText(authorMatch[1]);
      if (!cleanA.toLowerCase().includes('login') && !cleanA.toLowerCase().includes('favorite')) {
        author = cleanA;
      }
    }

    // 6. Daftar Bab
    const chapters = [];
    const chSeen = {};
    const chRegex = /<div class=['"]flexch-infoz['"]>[\s\S]*?<a[^>]+href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;
    let chMatch;
    let idx = 1;
    while ((chMatch = chRegex.exec(html)) !== null) {
      const chUrl = chMatch[1];
      const innerA = chMatch[2];
      
      // Pisahkan tanggal agar tidak menyatu dengan judul bab
      const dateMatch = innerA.match(/<span class=['"]date['"]>([^<]*)<\/span>/i);
      const chDate = dateMatch ? this._cleanText(dateMatch[1]) : "";
      
      // Bersihkan tanggal dari judul bab
      const pureTitleHtml = innerA.replace(/<span class=['"]date['"]>[\s\S]*?<\/span>/gi, '');
      const rawTitle = this._cleanText(pureTitleHtml) || `Chapter ${idx}`;

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

    // Urutan bab dari Bab 1 ke terbaru
    chapters.reverse();

    return {
      title: title,
      alternative_titles: altTitle,
      cover: cover,
      synopsis: synopsis,
      genres: genres,
      status: status,
      type: type,
      author: author,
      chapters: chapters
    };
  },

  // 3. getChapterContent(chapterSlug)
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
    const startMatch = html.match(/<div[^>]+(?:id=['"]content['"]|class=['"][^'"]*(?:text-left|epcontent|entry-content|read-content)[^'"]*['"])[^>]*>/i);
    if (startMatch) {
      const startIdx = startMatch.index + startMatch[0].length;
      const sub = html.substring(startIdx);
      const endMatch = sub.match(/<div[^>]+(?:class=['"][^'"]*(?:comment|wpd-|entry-pagination|bottom|nav-links|social-share)[^'"]*['"]|id=['"]comments['"])/i);
      contentHtml = endMatch ? sub.substring(0, endMatch.index) : sub;
    } else {
      const pMatches = html.match(/<p>[\s\S]*?<\/p>/gi);
      if (pMatches) {
        contentHtml = pMatches.join('\n');
      }
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
