/**
 * Created by superphung on 11/29/15.
 */
var app = require('../app.js');
var router = require('koa-router')();

var companion = require('./../controllers/companion');

router.get('/', function *() {
    this.body = 'hello world';
});
router.get('/companions', companion.list);

app.use(router.routes());