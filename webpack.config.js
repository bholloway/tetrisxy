'use strict';

var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry  : {
    index: [
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/only-dev-server',
      './src/index.js'
    ]
  },
  output : {
    path         : path.join(__dirname, 'dist'),
    filename     : '[name].js',
    chunkFilename: '[name].js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module : {
    loaders: [
      {
        test   : /\.jsx?$/,
        loaders: ['react-hot', 'babel'],
        include: path.join(__dirname, 'src')
      }, {
        test  : /\.scss$/,
        loader: 'style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!sass'
      }, {
        test  : /\.css$/,
        loader: 'style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
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
  }
};
