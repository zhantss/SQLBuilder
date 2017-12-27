//@ts-nocheck

var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var webpack = require('webpack');
var config = require('./webpack.config');

var data_init = require('./example/init');
var data_groups = require('./example/group');
var data_models = require('./example/model');
var data_sources = require('./example/source');
var query = require('./example/query')

var app = express();
var compiler = webpack(config);

app.use(express.static(path.join(__dirname, '/')))
//use in webpack development mode
app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
}));
app.use(require('webpack-hot-middleware')(compiler));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(app.router)

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/test', function (req, res) {
    res.sendFile(path.join(__dirname, '/example/data.json'));
});

app.post('/get/model/init', function (req, res) {
    if (req.body && req.body.modelId) {
        console.log(req.body.modelId)
        res.send(data_init)
    } else {
        res.send({ error: "no model id" })
    }
});

app.get('/get/resources/group', function (req, res) {
    res.send(data_groups)
});
app.get('/get/resources/model', function (req, res) {
    res.send(data_models)
});
app.get('/get/resources/source', function (req, res) {
    res.send(data_sources)
});

app.post('/sql/model/preview', function (req, res) {
    // console.log(req.body)
    if (req.body && req.body.sql) {
        const sql = req.body.sql;
        res.send(query(sql))
    }
});

app.post('/sql/model/save', function (req, res) {
    // console.log(req.body)
    if (req.body && req.body.sqls) {
        const sqls = req.body.sqls;
        res.send("ok");
    } else {
        res.send("error");
    }
});

app.listen(80, '0.0.0.0', function (err) {
    if (err) {
        console.log(err);
        return;
    }

    console.log('Listening at http://0.0.0.0:80');
});