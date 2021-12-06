const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
  context: __dirname,
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].js'
  },
  devServer: {
    publicPath: "/",
    contentBase: "/dist",
    hot: true,
    watchOptions: {
      poll: true
    },
    host: '0.0.0.0',
    port: 9118,
    historyApiFallback: true,
    disableHostCheck: true
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.(s[ac]ss||css)$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader'
          }
        ]
      }
    ],
  },
  resolveLoader: {
    modules: [
        path.join(__dirname, 'node_modules')
    ]
  },
  resolve: {
    modules: [
        path.join(__dirname, 'node_modules')
    ],
    alias: {
      'common-components': 'common/components',
      'common-helpers': 'common/helpers',
      'common-stylesheets': 'common/stylesheets'
    },
    fallback: { crypto: false }
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
    }),
  ],
};
