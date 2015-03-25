'use-strict';

var pkg = require('./package');
var cfg = require('./config');

var path = require('path');
var gulp = require('gulp');
var glob = require('globby');
var fs = require('fs-extra');
var del = require('del');

// Magic libs
var traverse = require('traverse');
var JadeInheritance = require('jade-inheritance');

// Log jammin'
var log = require('logr.js').log('gulpfile');

var logJSON = function prettyJSON(obj) {
  console.log(JSON.stringify(obj, null, 2));
};

// Modest dependency map
var pages = {};

// Start Gulp tasks
var $ = require('gulp-load-plugins')({
  camelize: true
});

gulp.task('default', function(cb) {
  $.sequence('clean', 'build')(cb);
});

gulp.task('build', function(cb) {
  $.sequence('jade', 'dependency-graph')(cb);
});

gulp.task('clean', function(cb) {
  del([cfg.paths.dest], cb);
});

gulp.task('jade', function() {

  return gulp.src([
      cfg.patterns.jade
    ], {
      cwd: path.join(cfg.paths.src, cfg.paths.jade.pages)
    })
    .pipe($.tap(function(file, t) {

      // Create array for page dependencies
      pages[path.relative(file.cwd, file.path)] = [];
    }))
    .pipe($.jade({
      pretty: true
        // , debug: true
    }))
    .pipe(gulp.dest(cfg.paths.dest));
});

gulp.task('dependency-graph', function(cb) {

  var inheritance;
  var filename;
  var pagename;
  var page;

  glob([
    // TODO: Clean up. Not sure if it's better to do in two passes or nest folders?
    path.join(cfg.paths.src, cfg.paths.jade.layouts, cfg.patterns.jade),
    path.join(cfg.paths.src, cfg.paths.jade.partials, cfg.patterns.jade)
  ], function(err, paths) {

    // What could go worng?
    if (err) {
      log.info(err);
    }

    paths.map(function(filename) {

      // Create dependency tree
      inheritance = new JadeInheritance(filename, cfg.paths.src, {
        basedir: cfg.paths.src
      });

      // Normalize file name
      filename = path.relative(cfg.paths.src, filename);

      // Traverse tree
      traverse(inheritance.tree).map(function(node) {

        if (this.isLeaf) {

          // Normalize path name
          pagename = path.relative(cfg.paths.jade.pages, this.key);

          // Get page obj
          page = pages[pagename];

          // Effectively filtering out unused pages, layouts and partials
          if (page !== undefined) {

            // May be safer to add in reverse order so layouts are last,
            // but if code is modular, it shoudln't matter.
            page.unshift(filename);
          }
        }
      });
    });

    // List dependencies
    Object.keys(pages).forEach(function(pagename) {

      log.info(pagename, 'dependencies:');

      pages[pagename]
        .map(function(dependency) {

          // Insert webpack magic here
          log.info('>', dependency);
        });
    });

    // Fin
    cb();
  });
});
