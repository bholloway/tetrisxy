'use strict';

var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

module.exports = {
  devtool  : 'eval',
  entry    : {
    index: [
      './src/index.js'
    ]
  },
  output   : {
    path         : path.join(__dirname, 'dist'),
    filename     : '[name].js',
    chunkFilename: '[name].js'
  },
  module   : {
    preloaders: [
      {
        test   : /\.jsx?$/,
        loaders: ['eslint'],
        include: path.join(__dirname, 'src')
      }
    ],
    loaders   : [
      {
        test   : /\.jsx?$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'src')
      }, {
        test  : /\.scss$/,
        loader: 'style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass'
      }, {
        test  : /\.css$/,
        loader: 'style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss'
      }, {
        test  : /\.png$/,
        loader: 'url?limit=100000'
      }, {
        test  : /\.(eot|svg|woff2?)([#?].*)?$/i,
        loader: 'file'

      }, {
        test  : /\.jpg$/,
        loader: 'file'
      }
    ]
  },

  postcss: function () {
    return [autoprefixer];
  }
};
