'use-strict';

var rek = require('rekuire');
var path = require('path');
var glob = require('globby');
var fs = require('fs-extra');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

// Utils
var logger = rek('utils/log/server')('webpack');
var patterns = rek('utils/glob')
  .patterns;
var ignore = rek('utils/glob')
  .ignore;

// Config
var cfg = rek('configs/common');

var BUNDLE = ['js', 'css'].reduce(function(o, i) {
  o[i] = path.join('[name]', ['index', i].join('.'));
  return o;
}, {});

// Create entry points
var entry = {};
var chunks = [];
var entryName;

// Create 'pages' entry points
var cwd = cfg.paths.pages;
var entry = glob.sync([patterns.js], {
    cwd: cwd
  })
  .reduce(function(obj, entryPath) {
    entryName = path.dirname(entryPath);
    obj[entryName] = path.join(cwd, entryPath);
    chunks.push(entryName);
    return obj;
  }, {});

// Add 'vendor' entry point
entryName = cfg.dir.vendor;
chunks.push(entryName);
entry[entryName] = cfg.paths.vendor;

// Add plugins
var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(true),
  new webpack.optimize.CommonsChunkPlugin({
    name: cfg.dir.common,
    filename: BUNDLE.js,
    chunks: chunks
  }),
  new ExtractTextPlugin(BUNDLE.css, {
    allChunks: true
  })
];

var modulesDirectories = [
  cfg.paths.source,
  cfg.paths.package.node,
  cfg.paths.package.bower,
  cfg.paths.utils
];

module.exports = {
  debug: true,
  devtool: '#inline-source-map',
  src: [
    patterns.js
  ],
  resolve: {
    modulesDirectories: modulesDirectories
  },
  context: cfg.paths.source,
  entry: entry,
  plugins: plugins,
  output: {
    path: cfg.paths.dest,
    filename: BUNDLE.js
  }
};
