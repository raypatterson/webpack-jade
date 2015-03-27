'use-strict';

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
  paths: {
    root: __dirname,
    common: 'common',
    vendor: 'vendor',
    source: 'source',
    app: '',
    pages: 'pages',
    dest: './.tmp',
    node: 'node_modules',
    bower: 'bower_components',
    data: {
      global: './source/data/global.json'
    },
    jade: {
      layouts: 'templates/_layouts',
      partials: 'templates/_partials'
    }
  }
};
