//@ts-nocheck

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const IgnorePlugin = webpack.IgnorePlugin;

module.exports = {
    devtool: 'source-map',
    entry: {
        polyfill: ['babel-polyfill'],
        vendor: ['react', 'react-dom', 'redux', 'react-redux', 'react-router', 'react-router-dom', 'react-router-redux'],
        plugin: ['redux-saga', 'redux-logger', 'immutable', 'redux-immutable'],
        ui: ['react-tap-event-plugin', 'material-ui'],
        tool: ['axios', 'bowser', 'classnames', 'uuid', 'sql-parser'],
        sqlbuilder: ['./src/index.tsx', 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000']
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].bundle.js'
    },
    plugins: [
        new IgnorePlugin(/(^fs$|cptable|jszip|xlsx|^es6-promise$|^net$|^tls$|^forever-agent$|^tough-cookie$|cpexcel|^path$|^request$|react-native|^vertx$)/),       // for alasql
        new HtmlWebpackPlugin({
            template: path.join(__dirname, '/src/html/index.tpl.html'),
            inject: 'body',
            filename: 'index.html'
        }),
        // new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ],
    module: {
        noParse: [/alasql/],
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: ['react-hot-loader', {
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015', 'stage-1', 'react']
                    }
                }]

            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loaders: [{
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015', 'stage-1', 'react']
                    }
                }, 'ts-loader']
            },
            {
                test: /\.scss$/,
                loaders: ['style-loader', 'css-loader', {
                    loader: 'postcss-loader',
                    options: {
                        plugins: () => { return [ autoprefixer ]; }
                    }
                }, 'sass-loader']
            },
            { test: /\.woff(2)?(\?[a-z0-9#=&.]+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
            { test: /\.(ttf|eot|svg)(\?[a-z0-9#=&.]+)?$/, loader: 'file' }
        ]
    },
    node: {
        fs: "empty"
    },
    resolve: {
        extensions: ['.json', '.css', '.sass', '.js', '.jsx', '.ts', '.tsx']
    }
}