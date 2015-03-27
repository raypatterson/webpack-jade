'use-strict';

var rek = require('rekuire');
var path = require('path');
var args = require('yargs')
  .argv;

var logger = rek('utils/log/server')('config');

/*

Passing `--release` flag E.g. gulp compile --release
will set the 'is_release' boolean

*/

var isRelease = (args.release) ? true : false;

/*

May be used to enable optimizations,
disable debugging,
file name reving,
semver bumping,
etc.

*/

// Directory name fragments that can be used to manipulate paths to 'dest' output
var dir = {
  utils: 'utils', // TODO: Create package in bower or npm
  source: 'source', // Work is done here
  project: 'app', // Project specific
  vendor: 'lib', // 3rd party
  pages: 'app/pages', // Page specific
  modules: 'app/modules', // Non-page specific
  data: 'app/data', // JSON, YAML, etc.
  common: 'com', // Split and bundled by webpack, only appears in 'dest' output
  temp: '.tmp', // Development target
  dist: 'dist', // Deployment target
  get dest() {
    return isRelease ? this.dist : this.temp
  }
};

// Absolute paths
var paths = {
  root: __dirname,
  get utils() {
    return path.join(this.root, dir.utils);
  },
  get dest() {
    return path.join(this.root, dir.dest);
  },
  get source() {
    return path.join(this.root, dir.source);
  },
  get project() {
    return path.join(this.source, dir.project);
  },
  get vendor() {
    return path.join(this.source, dir.vendor);
  },
  get modules() {
    return path.join(this.source, dir.modules);
  },
  get pages() {
    return path.join(this.source, dir.pages);
  },
  get data() {
    return path.join(this.source, dir.data);
  },
  get jade() {
    // XXX: Do these paths  need underscores? Is this aesthetic or can be used at a filter pattern?
    return {
      layouts: path.join(this.project, 'templates/_layouts'),
      partials: path.join(this.project, 'templates/_partials')
    };
  },
  // Package managers
  get package() {
    return {
      bower: path.join(this.root, 'bower_components'),
      node: path.join(this.root, 'node_modules')
    }
  }
};

module.exports = {
  args: args,
  dir: dir,
  paths: paths,
  data: {
    global: rek(path.join(paths.data, 'global.json'))
  }
};
