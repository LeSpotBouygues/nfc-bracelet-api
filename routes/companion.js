/**
 * Created by superphung on 11/29/15.
 */
var app = require('../app.js');
var router = require('koa-router')();
var parseBody = require('koa-body')();

var companion = require('./../controllers/companion');

router.get('/', function *() {
    this.body = 'hello world';
});
router.post('/companions', parseBody, companion.create);
router.get('/companions', companion.list);
router.get('/companions/:idCompanion', companion.getById);

app.use(router.routes());