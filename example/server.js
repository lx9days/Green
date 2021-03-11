const express=require('express');
const bodyParser=require('body-parser');
const webpack=require('webpack');
const path=require('path');
const webpackDevMiddelware=require('webpack-dev-middleware');
const webpackHotMiddleware=require('webpack-hot-middleware');
const webpackConfig=require('./webpack.config');

const app=express();
const compiler=webpack(webpackConfig);

app.use(webpackDevMiddelware(compiler,{
    publicPath:'/dist/'
}));

app.use(webpackHotMiddleware(compiler));
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

const router=express.Router();

app.use(router);

const port=process.env.PORT||8080;

module.exports=app.listen(port,()=>{
    console.log('server');
});
console.log(process.env);