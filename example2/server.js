const express = require('express');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const path = require('path');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('./webpack.config');

const app = express();
const compiler = webpack(webpackConfig);

// 中间件：处理 webpack 输出
app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
}));

app.use(webpackHotMiddleware(compiler));

// 提供静态文件服务
app.use(express.static(__dirname));

// 处理表单与 JSON 请求
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 默认路由：访问 / 时返回 index.html
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
const port = process.env.PORT || 8080;
module.exports = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
