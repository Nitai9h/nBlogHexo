'use strict';

const path = require('path');
const themePkg = require('../package.json');

hexo.extend.helper.register('theme_version', function () {
  return 'v' + themePkg.version;
});

hexo.extend.filter.register('after_post_render', function (data) {
  const lazyload = hexo.theme.config.lazyload;

  if (!lazyload || !lazyload.enable) {
    return data;
  }

  if (data.content) {
    data.content = data.content.replace(/<img([^>]*)src=["']([^"']+)["']([^>]*)>/gi, function (match, before, src, after) {
      if (match.includes('data-src=')) {
        return match;
      }

      let newAfter = after;
      if (!newAfter.includes('class=')) {
        newAfter = ' class=""' + newAfter;
      }

      const mediumZoom = hexo.theme.config.medium_zoom;
      if (mediumZoom && mediumZoom.enable) {
        if (!newAfter.includes('data-zoomable')) {
          newAfter = newAfter.replace(/class=["']([^"']*)["']/, 'class="$1" data-zoomable');
        }
      }

      return '<img' + before + 'data-src="' + src + '"' + newAfter + '>';
    });
  }

  return data;
});
