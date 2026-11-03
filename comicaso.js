// ID: ext_comicaso
// NAME: Comicaso (ID)
// TYPE: comic
// VERSION: 1.2.0
// COLOR: #0f1115
// ICON: https://v3.comicaso.pro/icons/icon-192.png
// REFERER: https://v3.comicaso.pro/

var KonmikExtension = {
  async getList(page, query, filters) {
    var url = 'https://api.comicaso.pro/home.php?source=comicazen&q=&mode=update&type=all&limit=20&offset=0';
    
    var res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36',
        'Referer': 'https://v3.comicaso.pro/',
        'Accept': 'application/json, */*',
      }
    });

    var text = await res.text();

    // Debug: throw with first 200 chars so we can see what we're getting
    if (!text || text.length === 0) {
      throw new Error('Response empty. status=' + res.status);
    }

    var firstChar = text.charCodeAt(0);
    var preview = text.slice(0, 100).replace(/[\r\n]/g, ' ');

    // If not JSON, show what we got
    if (firstChar !== 123 /* { */ && firstChar !== 91 /* [ */) {
      throw new Error('Not JSON! first_char=0x' + firstChar.toString(16) + ' status=' + res.status + ' preview=' + preview);
    }

    // Try parse
    var json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error('JSON.parse failed: ' + e.message + ' | first100=' + preview);
    }

    var items = (json && json.data) ? json.data : [];
    return {
      manga_list: items.map(function(item) {
        return {
          id: item.slug || '',
          title: item.title || '',
          cover_url: item.thumbnail || '',
          latest_chapter: item.latest_chapter ? String(item.latest_chapter) : '',
          rating: '',
          views: ''
        };
      })
    };
  },

  async getDetail(slug) {
    throw new Error('getDetail called for: ' + slug);
  },

  async getChapterImages(endpoint) {
    throw new Error('getChapterImages called for: ' + endpoint);
  }
};
