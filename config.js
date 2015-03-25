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
      layouts: 'layouts',
      partials: 'partials'
    }
  }
};
