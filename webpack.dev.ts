import { merge } from 'webpack-merge';
import common from './webpack.common';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import ForkTsCheckerNotifierWebpackPlugin from 'fork-ts-checker-notifier-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path, { resolve } from 'path';

// const tsLoader: any = common.module.rules.find(
//   (r: any) => r.loader === 'ts-loader',
// );
// if (tsLoader) {
//   tsLoader.options = {
//     ...tsLoader.options, // 可能为 undefined
//     transpileOnly: true,
//     getCustomTransformers: () => ({
//       before: [
//         // tsImportPluginFactory({
//         //     libraryName: 'antd',
//         //     libraryDirectory: 'es',
//         //     style: true,
//         //   }),
//         ReactRefreshTypeScript(),
//       ],
//     }),
//   };
// }

export default merge(common, {
  mode: 'development',
  // devtool: 'eval-source-map',
  output: {
    filename: '[name].bundle.js',
    publicPath: '/',
  },
  // resolve: {
  //   alias: {
  //     'react-dom': path.resolve('./lib/react-dom.development.js'),
  //     'react-refresh': path.resolve('./lib/react-refresh'),
  //   },
  // },
  devServer: {
    static: './public',
    historyApiFallback: true,
    host: '0.0.0.0',
    port: 8089,
    hot: true,
    // https: true,
    proxy: {
      '/api': {
        target: 'http://apis-sys-dev.earth.xpaas.lenovo.com/',
        // target: 'https://zuul-dev.lmp-sy.xpaas.lenovo.com/apis/apis-sys/',
        changeOrigin: true, // 默认false，是否需要改变原始主机头为目标URL
        // ws: true, // 是否代理websockets
        headers: {
          'SERVICE-AUTHENTICATION':
            'eyJhbGciOiJIUzI1NiJ9.eyJzZXJ2aWNlTmFtZSI6IjQyMTciLCJmdWxsU2VydmljZU5hbWUiOiJBUElTLS1hcGlzLXdlYiIsInNlcnZpY2VLZXkiOiIxODNiMTY3MDRkYWQ0NjI2YmVjYzc1MGVlZWVkOWU2MiIsInNlcnZpY2VUeXBlIjoiMiIsInNlcnZpY2VBcHAiOiIxNDQ4Iiwic2VydmljZUNsdXN0ZXIiOiIyIiwianRpIjoiNTFjZWQ0MWVkNmM3NDM4MTg3ZmI4YzFjYzNhYjM5ODAiLCJpYXQiOjE2NTIyNjE0ODF9.aXzH86B5noNfbY8q_Tfv_Lr1G7jX_CfYKRzZLbhhodc',
        },
        secure: false,
        pathRewrite: {
          '^/api': '',
        },
      },
      // '/file': {
      //   target: 'http://10.96.112.200:8080/',
      //   changeOrigin: true, // 默认false，是否需要改变原始主机头为目标URL
      //   // ws: true, // 是否代理websockets
      //   headers: {
      //     'SERVICE-AUTHENTICATION':
      //       'eyJhbGciOiJIUzI1NiJ9.eyJzZXJ2aWNlTmFtZSI6IjE4MjYiLCJzZXJ2aWNlS2V5IjoiZGY4YjVmY2FkMDAzNGUxMTkzNWY4MWY1MGNjMWFhNDgiLCJzZXJ2aWNlVHlwZSI6IjIiLCJzZXJ2aWNlQXBwIjoiMjM0Iiwic2VydmljZUNsdXN0ZXIiOiIyIiwianRpIjoiMGQ5NTkwNTc5MGQ1NDQyYmE3NjYwN2E5OTFiMzM0Y2UiLCJpYXQiOjE1ODI2MjA0ODF9.i69Tcr9yERq-dQBMJXSpI3V0QO8R8jvyuNjgL6i4hWk',
      //   },
      //   secure: false,
      //   pathRewrite: {
      //     '^/file': '',
      //   },
      // },
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'postcss-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'sass-loader', // compiles Sass to CSS, using Node Sass by default
          'postcss-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                // modifyVars: antdVar,
                javascriptEnabled: true,
                // plugins: [
                //     new LessPluginAntd2CssVariable(),
                //   ],
              },
            },
          },
        ],
      },
    ],
  },
  // optimization: {
  //     moduleIds: 'named'
  // },
  plugins: [
    // new webpack.NamedModulesPlugin(),
    new ForkTsCheckerWebpackPlugin({
      // eslint: true
    }),
    // new ForkTsCheckerNotifierWebpackPlugin({ title: 'TypeScript', excludeWarnings: false }),
    // new webpack.HotModuleReplacementPlugin(),
    // new ReactRefreshWebpackPlugin(),
  ],
});
