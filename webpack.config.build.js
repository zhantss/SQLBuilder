//@ts-nocheck

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const IgnorePlugin = webpack.IgnorePlugin;

module.exports = {
    // devtool: 'source-map',
    entry: {
       /*  polyfill: ['babel-polyfill'], */
        // vendor: [/* 'react', 'react-dom',  */'redux', 'react-redux', 'react-router', 'react-router-dom', 'react-router-redux', 'react-transition-group'],
        // plugin: ['redux-saga', 'redux-logger', 'immutable', 'redux-immutable', 'react-dnd', 'react-dnd-html5-backend'],
        // ui: [/* 'react-tap-event-plugin',  */'material-ui', 'material-design-icons', 'react-virtualized', 'react-sortable-hoc'],
        // tool: ['axios', 'bowser', 'moment', 'classnames', 'uuid'/*,  'alasql' */],
        // api: ['./src/common/api/api.ts', './src/common/api/url.ts', './src/common/api/required.ts', './src/common/api/urlrequired.ts'],
        sqlbuilder: ['./src/sqlbuilder.tsx'],
        start: ['./src/index.ts']
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js'
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "alasql" : "alasql"
    },
    plugins: [
        new IgnorePlugin(/(^fs$|cptable|jszip|xlsx|^es6-promise$|^net$|^tls$|^forever-agent$|^tough-cookie$|cpexcel|^path$|^request$|react-native|^vertx$)/),       // for alasql
        // new webpack.optimize.OccurrenceOrderPlugin(),
        // new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new ExtractTextPlugin({ filename: '[name].css', allChunks: true }),
        new webpack.optimize.CommonsChunkPlugin({
            // minChunks: 2,
            name: 'commons',
            filename: 'commons.js'
        }),
        new HtmlWebpackPlugin({
            /* chunks: ['vendor', 'plugin', 'ui', 'tool', 'api', 'sqlbuilder'], */
            template: path.join(__dirname, '/src/html/index.tpl.prod.html'),
            inject: 'body',
            filename: 'index.html',
            /* chunksSortMode: 'manual' */
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
                keep_fnames: true
            },
            compress: {
                warnings: false
            }
        })
    ],
    module: {
        noParse: [/alasql/],
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: ['babel-loader']

            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loaders: ['babel-loader', 'ts-loader']
            },
            {
                test: /\.s?css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader', {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => { return [ autoprefixer ]; }
                        }
                    }, 'sass-loader']
                })
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