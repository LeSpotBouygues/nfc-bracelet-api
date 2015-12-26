/**
 * Created by nana on 11/12/2015.
 */
var app = require('../app.js');
var router = require('koa-router')();
var parseBody = require('koa-body')();
var parseMultipart = require('koa-body')({formidable: {uploadDir: __dirname + '/..'}, multipart: true});

var task = require('../controllers/task');

router.get('/task', task.getList);
router.post('/task/import', parseMultipart, task.importTask);

app.use(router.routes());