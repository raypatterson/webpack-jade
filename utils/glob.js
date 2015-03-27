var path = require('path');
var glob = require('globby');
var fs = require('fs-extra');

module.exports = {

  patterns: {
    all: '**/*',
    js: '**/*.js',
    css: '**/*.css',
    json: '**/*.json',
    jade: '**/*.jade',
    html: '**/*.html',
    sass: '**/*.{scss,sass}'
  },

  ignore: function ignore(dir, pattern) {

    return '!' + path.join(dir, pattern);
  }
}
