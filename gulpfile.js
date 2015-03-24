'use-strict';

var pkg = require('./package');
var cfg = require('./config');

var gulp = require('gulp');
var glob = require('globby');
var fs = require('fs-extra');
var del = require('del');
var traverse = require('traverse');

var JadeInheritance = require('jade-inheritance');

var log = function(ob) {
  console.log(JSON.stringify(ob, null, 4))
};

var $ = require('gulp-load-plugins')({
  camelize: true
});

gulp.task('default', function(cb) {
  $.sequence('clean', ['build'])(cb);
});

gulp.task('build', function(cb) {
  $.sequence(['jade'])(cb);
});

gulp.task('clean', function(cb) {
  del([cfg.paths.dest], cb);
});

gulp.task('jade', function() {

  return gulp.src([cfg.paths.jade.pages])
    .pipe($.jade({
      pretty: true
        // , debug: true
    }))
    .pipe(gulp.dest(cfg.paths.dest));
});

gulp.task('dependency-graph', function(cb) {

  glob([
    cfg.paths.jade.layouts,
    cfg.paths.jade.partials
  ], function(err, paths) {

    if (err) {
      console.log(err);
    }

    paths.reduce(function(list, filename) {
      console.log('filename', filename);

      var options = {
        basedir: cfg.paths.src
      };

      var inheritance = new JadeInheritance(filename, cfg.paths.src, options);
      // log('files');
      // log(inheritance.files);
      // log('tree');
      // log(inheritance.tree);

      var walk = traverse(inheritance.tree);
      var paths = walk.paths();
      // log('paths');
      // log(paths);
      // log('---');
      walk
        .reduce(function(pageContexts, node) {

          if (this.isLeaf) {

            // log(node);
            log(this.parent.node);
          }
        }, {});
      log('---');
    }, {});
  });
});
