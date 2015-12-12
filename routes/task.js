/**
 * Created by nana on 11/12/2015.
 */
var app = require('../app.js');
var router = require('koa-router')();
var parseBody = require('koa-body')();

var file = require('../middleware/file');
var task = require('../controllers/task');

router.get('/task', task.getList);
router.post('/task/import', file.setListTask, file.get, task.importTask);

app.use(router.routes());