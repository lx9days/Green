const path=require('path');``
const webpack=require('webpack');
const HtmlWebpackPlugin=require('html-webpack-plugin');
const {CleanWebpackPlugin} =require('clean-webpack-plugin');
const privatePlugin=require('@babel/plugin-proposal-private-methods');
const ESLintPlugin = require('eslint-webpack-plugin');


module.exports={
    entry:{
        main:"./src/index.js"
    },
    mode:"development",
    devtool:'source-map',
    output:{
        path:path.resolve(__dirname,'dist'),
        filename:'[name].js'
    },
    performance:false,
    optimization:{
        usedExports:true,
        splitChunks:{
            chunks:'all'
        }
    },
    module:{
        rules:[
            {
                test:/\.(csv|eot|ttf|svg|woff)$/,
                use:{
                    loader:'file-loader'
                }
            },
            {
                test:/\.css$/,
                use:['style-loader','css-loader']
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                  loader: "babel-loader",
                  options: {
                    "presets": [
                      [
                        "@babel/preset-env",
                        {
                          "useBuiltIns":"usage",
                          "targets": {
                            "chrome": "67"
                          }
                        }
                      ],
                    ],
                    "plugins": [
                      "@babel/plugin-syntax-dynamic-import",
                      "@babel/plugin-proposal-class-properties",
                      "@babel/plugin-proposal-private-property-in-object",
                      "@babel/plugin-proposal-private-methods"
                    ]
                  }
                }
              }
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:'./src/index.html'
        }),
        new CleanWebpackPlugin({
            root:path.resolve(__dirname,'./')
        }),
        new webpack.HotModuleReplacementPlugin(),
        new ESLintPlugin()
    ]

    
}