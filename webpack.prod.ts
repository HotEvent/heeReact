import { merge } from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import common from './webpack.common';
import TerserPlugin from 'terser-webpack-plugin';
import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import antdVar from './antd.var';
// import {BundleAnalyzerPlugin} from'webpack-bundle-analyzer');
import FileManagerPlugin from 'filemanager-webpack-plugin';
module.exports = merge(common, {
  mode: 'production',
  // devtool: 'source-map',
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, './build'),
    publicPath: '/',
  },
  // stats: {
  //     // Examine all modules
  //     maxModules: Infinity,
  //     // Display bailout reasons
  //     optimizationBailout: true
  // },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader', // translates CSS into CommonJS
          'postcss-loader',
          'sass-loader', // compiles Sass to CSS, using Node Sass by default
        ],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader', // translates CSS into CommonJS
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                // modifyVars: antdVar,
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader', // translates CSS into CommonJS
          'postcss-loader',
        ],
      },
      // {
      //     loader: 'webpack-ant-icon-loader',
      //     enforce: 'pre',
      //     // options:{
      //     //   chunkName:'antd-icons'
      //     // },
      //     include: [
      //         require.resolve('@ant-design/icons/lib/dist')
      //     ]
      // }
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // commons: {
        //     test: /[\\/]node_modules[\\/]/,
        //     name: 'vendors',
        //     // chunks: 'all'
        //     chunks: function (chunk) {
        //         // 这里的name 可以参考在使用`webpack-ant-icon-loader`时指定的`chunkName`
        //         return chunk.name !== 'antd-icons';
        //     },
        //     // priority: 1
        // },
        // styles: {
        //     name: 'styles',
        //     type: 'css/mini-extract',
        //     // For webpack@4
        //     // test: /\.css$|\.scss$|\.less$/,
        //     chunks: 'all',
        //     enforce: true,
        //     // priority: 2
        // },
      },
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          globOptions: {
            ignore: ['**/index.html'],
          },
        },
        {
          from: 'nginx',
        },
      ],
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].[contenthash].css',
      // chunkFilename: "[id].[contenthash].css"
    }),
    new CleanWebpackPlugin(),
    new FileManagerPlugin({
      events: {
        onEnd: {
          archive: [
            {
              source: './build',
              destination: './build/build.tar',
              format: 'tar',
            },
          ],
        },
      },
    }),
    // new BundleAnalyzerPlugin()
  ],
});
