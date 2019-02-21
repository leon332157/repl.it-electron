'use strict';

const webpack = require('webpack');
const path = require('path');

module.exports = {
    'entry': './src/app/index.js',
    'watchOptions': {
        'ignored': /node_modules/
    },
    'output': {
        'path': path.resolve(__dirname, 'build/js'),
        'filename': 'app.bundle.js'
    },
    'resolve': {
        'extensions': [
            '.js', '.json', '.scss', '.html', '.txt'
        ],
        'modules': [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'scss'),
            path.resolve(__dirname, 'node_modules')
        ],
        'alias': {
        }
    },
    'plugins': [
//         new webpack.DefinePlugin({
//             'process.env': {
//                 'NODE_ENV': JSON.stringify('development')
//             }
//         })
    ],
    'module': {
        'rules': [
            {
                'test': /\.js$/,
                'exclude': /node_modules/,
                'use': [
                    {
                        'loader': 'cache-loader'
                    },
                    {
                        'loader': 'babel-loader',
                        'options': {
                            'presets': ['env', 'react'],
                            'plugins': ['transform-object-rest-spread', 'transform-class-properties']
                        }
                    }
                ]
            },
            {
                'test': /\.json5$/,
                'use': 'json5-loader'
            },
            {
                'test': /\.html$/,
                'use': {
                    'loader': 'html-loader',
                    'options': {
                        'attrs': false
                    }
                }
            },
            {
                'test': /\.txt$/,
                'use': 'raw-loader'
            },
            {
                'test': /\.scss$/,
                'use': [
                    {
                        'loader': 'cache-loader'
                    },
                    {
                        'loader': 'style-loader'
                    },
                    {
                        'loader': 'css-loader'
                    },
                    {
                        'loader': 'sass-loader',
                        'options': {
                        }
                    }
                ]
            }
        ]
    }
};
