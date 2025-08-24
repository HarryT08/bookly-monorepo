const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/main.ts',
  target: 'node',
  mode: 'development',
  devtool: 'source-map',
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true, // Speed up compilation
            experimentalWatchApi: true,
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@libs': path.resolve(__dirname, 'src/libs'),
      '@apps': path.resolve(__dirname, 'src/apps'),
      '@common': path.resolve(__dirname, 'src/libs/common'),
      '@dto': path.resolve(__dirname, 'src/libs/dto'),
      '@event-bus': path.resolve(__dirname, 'src/libs/event-bus'),
      '@logging': path.resolve(__dirname, 'src/libs/logging'),
      '@monitoring': path.resolve(__dirname, 'src/libs/monitoring'),
      '@i18n': path.resolve(__dirname, 'src/libs/i18n'),
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  plugins: [
    // Only enable TypeScript checker in production to save memory
    ...(process.env.NODE_ENV === 'production' ? [
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          memoryLimit: 8192, // 8GB memory limit
          configFile: path.resolve(__dirname, 'tsconfig.json'),
        },
        async: false,
      })
    ] : []),
  ],
  watchOptions: {
    poll: process.env.CHOKIDAR_USEPOLLING === 'true' ? 1000 : false,
    aggregateTimeout: 300,
    ignored: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/test/**',
      '**/prisma/**',
      '**/logs/**',
      '**/.git/**',
      '**/docker/**',
      '**/data/**',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/README.md',
      '**/*.md',
    ],
  },
  optimization: {
    minimize: false, // Disable minification in development
    splitChunks: false,
  },
  stats: {
    warnings: false,
    children: false,
    modules: false,
  },
};
