'use-strict';

var rek = require('rekuire');
var path = require('path');
var glob = require('globby');
var fs = require('fs-extra');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var cfg = rek('config');

var logger = rek('dev/utils/log')('webpack');

var BUNDLE_FILENAMES = ['js', 'css'].reduce(function(o, i) {
  o[i] = ['index', i].join('.');
  return o;
}, {});

// Construct paths
var appPath = path.join(cfg.paths.source, cfg.paths.app);
var pagesPath = path.join(appPath, cfg.paths.pages);

// Glob entry points from 'pages' dir
// TODO: Clean up entry creation
var entry = {};
var chunks = [];
var entryName;

var entry = glob.sync(
[
  cfg.patterns.js
], {
      // cwd: pagesPath
      cwd: cfg.paths.source
    }
  )
  .reduce(function(obj, filePath) {
    var entryName = path.dirname(filePath);
    obj[entryName] = filePath;
    chunks.push(entryName);

    logger.debug('filePath', filePath);
    logger.debug('entryName', entryName);
    return obj;
  }, {});

logger.debug('entry', entry);

// Add plugins
var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(true),
  new webpack.optimize.CommonsChunkPlugin({
    name: cfg.paths.common,
    filename: '[name]/' + BUNDLE_FILENAMES.js,
    chunks: chunks
  }),
  new ExtractTextPlugin(path.join('[name]', BUNDLE_FILENAMES.css), {
    allChunks: true
  })
];

var modulesDirectories = [
  appPath,
  cfg.paths.node,
  cfg.paths.bower
];

logger.debug('appPath', appPath);
logger.debug('pagesPath', pagesPath);
logger.debug('entry', entry);
logger.debug('chunks', chunks);

module.exports = {
  debug: true,
  devtool: '#inline-source-map',
  src: [
    cfg.patterns.js
  ],
  resolve: {
    modulesDirectories: modulesDirectories
  },
  entry: entry,
  plugins: plugins,
  output: {
    path: path.join(cfg.paths.root, cfg.paths.dest),
    filename: path.join('[name]', BUNDLE_FILENAMES.js)
  }
};
