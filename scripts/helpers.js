'use strict';

const path = require('path');
const themePkg = require('../package.json');

hexo.extend.helper.register('theme_version', function() {
  return 'v' + themePkg.version;
});
