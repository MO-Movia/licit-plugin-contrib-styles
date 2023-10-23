/* eslint-disable */

import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import WriteFilePlugin from 'write-file-webpack-plugin';
import path, { dirname } from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { fileURLToPath } from 'url';

const NODE_ENV = process.env.NODE_ENV || 'production';
let isDev = 'development' === NODE_ENV || 0;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let options = {
  mode: NODE_ENV,
  entry: {
    index: path.join(__dirname, 'src', 'index.js'),
  },
  output: {
    path: path.join(__dirname, 'bin'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx)$/,
        include: /node_modules/,
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    alias: {},
    extensions: ['.tsx', '.ts', '.js', '.json'],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    }),
  ],
};

if (isDev) {
  options.devtool = 'source-map';
} else {
  options.optimization = {
    minimize: true,
    minimizer: [new TerserPlugin()],
  };
}

options.plugins.push(function () {
  this.hooks.done.tapAsync('done', function (stats, callback) {
    if (0 < stats.compilation.errors.length) {
      console.log('\x1b[31m%s\x1b[0m', stats.compilation.errors);
      process.exit(1);
    } else {
      callback();
      process.exit(0);
    }
  });
});

export default options;
