'use-strict';

var rek = require('rekuire');
var path = require('path');
var glob = require('globby');
var fs = require('fs-extra');
var del = require('del');
var bs = require('browser-sync');
var gulp = require('gulp');
var webpack = require('webpack');

// Magic libs
var traverse = require('traverse');
var JadeInheritance = require('jade-inheritance');
var jsdiff = require('jsdiff');
var jsondiffpatch = require('jsondiffpatch');

var pkg = rek('package');
var cfg = rek('config');
var wpk = rek('config.webpack');
var logger = rek('utils/log/server')('gulpfile');
var patterns = rek('utils/glob')
  .patterns;
var ignore = rek('utils/glob')
  .ignore;

// Modest dependency map
var pages = {};

// Batch import 'gulp-*' tasks packages
var $ = require('gulp-load-plugins')({
  camelize: true
});

gulp.task('default', function(cb) {
  $.sequence(
    [
      'todo',
      'clean'
    ], [
      'copy',
      'build'
      ],
    'server'
  )(cb);
});

gulp.task('beautify', function() {
  gulp.src(
    [
      patterns.js
    ], {
        cwd: cfg.paths.project
      })
    .pipe($.beautify())
    .pipe(gulp.dest(cfg.paths.project));
});

gulp.task('todo', function() {

  gulp.src(
    [
      patterns.js,
      patterns.css,
      patterns.sass,
      patterns.html,
      patterns.jade,
      ignore(cfg.paths.package.node, patterns.all),
      ignore(cfg.paths.package.bower, patterns.all),
      ignore(cfg.paths.vendor, patterns.all)
    ], {
        cwd: cfg.paths.root
      })
    .pipe($.todo())
    .pipe(gulp.dest(cfg.paths.root));
});

gulp.task('clean', function(cb) {
  del(
    [
      cfg.paths.dest
    ], cb);
});

gulp.task('copy', function(cb) {
  return gulp.src(
    [
      patterns.json
    ], {
        cwd: cfg.paths.pages
      })
    .pipe(gulp.dest(cfg.paths.dest));
});

gulp.task('build', function(cb) {
  $.sequence(
    'jade',
    'dependency-graph',
    'webpack'
  )(cb);
});

gulp.task('jade', function() {

  return gulp.src(
    [
      patterns.jade
    ], {
        cwd: cfg.paths.pages
      })
    .pipe($.data(function(file, cb) {

      var jsonPath =
        file.path.substr(0, file.path.lastIndexOf('.') + 1) + 'json';

      fs.readJson(jsonPath, function(err, pageData) {

        if (err) {
          logger.error(err);
        }

        logger.debug('cfg.data.global', cfg.data.global);
        logger.debug('pageData', pageData);

        var delta = jsondiffpatch.diff(cfg.data.global, pageData);

        logger.log('delta', jsondiffpatch.formatters.annotated.format(delta));

        pageData.relativePath =
          path.relative(path.dirname(file.path), file.base);
        pageData.title = [
          cfg.data.global.page.title.prefix,
          pageData.title
        ].join(cfg.data.global.page.title.delimiter);

        cb(null, pageData);
      });
    }))
    .pipe($.tap(function(file, t) {

      // Create array for page dependencies
      pages[path.relative(file.cwd, file.path)] = [];
    }))
    .pipe($.jade({
      basedir: cfg.paths.project,
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

  glob(
    [
      // TODO: Clean up. Not sure if it's better to do in two passes or nest folders?
      path.join(cfg.paths.jade.layouts, patterns.jade),
      path.join(cfg.paths.jade.partials, patterns.jade)
    ],
    function(err, paths) {

      // What could go worng?
      if (err) {
        log.info(err);
      }

      paths.map(function(filename) {

        // Create dependency tree
        inheritance = new JadeInheritance(filename, cfg.paths.project, {
          basedir: cfg.paths.project
        });

        // Normalize file name
        filename = path.relative(cfg.paths.project, filename);

        // Traverse tree
        traverse(inheritance.tree)
          .map(function(node) {

            if (this.isLeaf) {

              // Normalize path name
              pagename = path.relative(cfg.paths.pages, this.key);

              // Get page object
              page = pages[pagename];

              // Filter unused pages, layouts and partials
              if (page !== undefined) {

                // May be safer to add in reverse order so layouts are last,
                // but if code is modular, it shoudln't matter.
                page.unshift(filename);
              }
            }
          });
      });

      // List dependencies
      Object.keys(pages)
        .forEach(function(pagename) {

          logger.info(pagename, 'dependencies:');

          pages[pagename]
            .map(function(dependency) {

              // Insert webpack magic here
              logger.info('>', dependency);
            });
        });

      // Fin
      cb();
    });
});

gulp.task('webpack', function(cb) {

  return gulp.src(
      [
        patterns.js
      ], {
        cwd: cfg.paths.source
      })
    .pipe($.webpack(wpk, webpack))
    .pipe(gulp.dest(cfg.paths.dest));
});

// Server

gulp.task('server', function() {

  bs({
    notify: false,
    logPrefix: 'server',
    server: [
      cfg.paths.dest,
      cfg.paths.source
    ]
  });

  var onChange = function onChange(event) {
    logger.info(
      'File ' + event.path + ' was ' + event.type + ', running tasks...'
    );
  };

  gulp.watch(
      [
        patterns.js,
        patterns.sass,
        patterns.jade,
        patterns.json
      ], {
        cwd: cfg.paths.source
      }, [
        'build',
        bs.reload
      ]
    )
    .on('change', onChange);
});
