import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import path from 'path';
import 'webpack-dev-server';

const config: webpack.Configuration = {
  entry: {
    app: './src/index.tsx',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            // exclude: /node_modules/,
            options: {
              transpileOnly: true,
              onlyCompileBundledFiles: true,
              // getCustomTransformers: () => ({
              //   before: [ReactRefreshTypeScript()],
              // }),
              // getCustomTransformers: () => ({
              //   before: [
              //     tsImportPluginFactory({
              //       libraryName: 'antd',
              //       libraryDirectory: 'es',
              //       style: true,
              //     }),
              //   ],
              // }),
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    new webpack.DefinePlugin({}),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};

export default config;
