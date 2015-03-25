'use-strict';

module.exports = {

  patterns: {
    jade: '**/*.jade'
  },
  paths: {
    src: 'source',
    dest: '.tmp',
    jade: {
      pages: 'pages',
      layouts: 'templates/_layouts',
      partials: 'templates/_partials'
    }
  }
};
