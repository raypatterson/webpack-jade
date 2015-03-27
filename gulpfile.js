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

// TODO: Pick one diff/patch lib for template config overrides and includes
var jsdiff = require('jsdiff');
var jsondiffpatch = require('jsondiffpatch');

// Utils
var logger = rek('utils/log/server')('gulpfile');
var patterns = rek('utils/glob')
  .patterns;
var ignore = rek('utils/glob')
  .ignore;

// Configs
var pkg = rek('package');
var cfg = require('require-directory')(module, './configs'); // Recursively require all configs

// Batch import 'gulp-*' tasks packages
var $ = require('gulp-load-plugins')({
  camelize: true
});

// Sequences
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

// Tasks

// TODO: Move tasks into separate files & sort out interdependencies between Jade & webpack

gulp.task('beautify', function() {
  gulp.src(
    [
      patterns.js
    ], {
        cwd: cfg.common.paths.project
      })
    .pipe($.beautify())
    .pipe(gulp.dest(cfg.common.paths.project));
});

gulp.task('todo', function() {

  gulp.src(
    [
      patterns.js,
      patterns.css,
      patterns.sass,
      patterns.html,
      patterns.jade,
      ignore(cfg.common.paths.package.node, patterns.all),
      ignore(cfg.common.paths.package.bower, patterns.all),
      ignore(cfg.common.paths.vendor, patterns.all)
    ], {
        cwd: cfg.common.paths.root
      })
    .pipe($.todo({
      verbose: true
    }))
    .pipe(gulp.dest(cfg.common.paths.root));
});

gulp.task('clean', function(cb) {
  del(
    [
      cfg.common.paths.dest
    ], cb);
});

gulp.task('copy', function(cb) {
  return gulp.src(
    [
      patterns.json
    ], {
        cwd: cfg.common.paths.pages
      })
    .pipe(gulp.dest(cfg.common.paths.dest));
});

gulp.task('build', function(cb) {
  $.sequence(
    'jade',
    'dependency-graph',
    'webpack'
  )(cb);
});

/* Begin: Jade Tasks */

// Modest dependency map
var pages = {};

gulp.task('jade', function() {

  return gulp.src(
    [
      patterns.jade
    ], {
        cwd: cfg.common.paths.pages
      })
    .pipe($.data(function(file, cb) {

      var jsonPath =
        file.path.substr(0, file.path.lastIndexOf('.') + 1) + 'json';

      fs.readJson(jsonPath, function(err, pageData) {

        if (err) {
          logger.error(err);
        }

        // logger.debug('cfg.common.data.global', cfg.common.data.global);
        // logger.debug('pageData', pageData);

        var delta = jsondiffpatch.diff(cfg.common.data.global, pageData);

        // logger.log('delta', jsondiffpatch.formatters.annotated.format(delta));

        pageData.relativePath = path.relative(path.dirname(file.path), file.base);
        if (pageData.relativePath === '') {
          pageData.relativePath = '.';
        }

        pageData.title = [
          cfg.common.data.global.page.title.prefix,
          pageData.title
        ].join(cfg.common.data.global.page.title.delimiter);

        cb(null, pageData);
      });
    }))
    .pipe($.tap(function(file, t) {

      // Create array for page dependencies
      pages[path.relative(file.cwd, file.path)] = [];
    }))
    .pipe($.jade({
      basedir: cfg.common.paths.project,
      pretty: true
        // , debug: true
    }))
    .pipe(gulp.dest(cfg.common.paths.dest));
});

gulp.task('dependency-graph', function(cb) {

  var basedir = cfg.common.paths.project;
  var inheritance;
  var fileName;
  var pageName;
  var page;

  glob(
    [
      // TODO: Clean up. Not sure if it's better to do in two passes or nest folders?
      path.join(cfg.common.paths.jade.layouts, patterns.jade),
      path.join(cfg.common.paths.jade.partials, patterns.jade)
    ],
    function(err, paths) {

      // What could go worng?
      if (err) {
        log.info(err);
      }

      paths.map(function(fileName) {

        // Create dependency tree
        inheritance = new JadeInheritance(fileName, basedir, {
          basedir: basedir
        });

        // Normalize file name
        fileName = path.relative(cfg.common.paths.project, fileName);

        // Traverse tree
        traverse(inheritance.tree)
          .map(function(node) {

            if (this.isLeaf) {

              // Normalize path name
              pageName = path.relative(cfg.common.dir.pages, this.key);

              // Get page object
              page = pages[pageName];

              // Filter unused pages, layouts and partials
              if (page !== undefined) {

                // May be safer to add in reverse order so layouts are last,
                // but if code is modular, it shoudln't matter.
                page.unshift(fileName);
              }
            }
          });
      });

      // List dependencies
      Object.keys(pages)
        .forEach(function(pageName) {

          logger.info(pageName, 'dependencies:');

          pages[pageName]
            .map(function(dependency) {

              // Insert webpack magic here
              logger.info('>', dependency);
            });
        });

      // Fin
      cb();
    });
});

/* End: Jade Tasks */

gulp.task('webpack', function(cb) {

  return gulp.src(
      [
        patterns.js
      ], {
        cwd: cfg.common.paths.source
      })
    .pipe($.webpack(cfg.tasks.webpack, webpack))
    .pipe(gulp.dest(cfg.common.paths.dest));
});

// Server

gulp.task('server', function() {

  bs({
    notify: false,
    logPrefix: 'server',
    server: [
      cfg.common.paths.dest,
      cfg.common.paths.source
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
        cwd: cfg.common.paths.source
      }, [
        'build',
        bs.reload
      ]
    )
    .on('change', onChange);
});
