/**
 * Created by superphung on 11/29/15.
 */
var app = require('../app.js');
var router = require('koa-router')();
var parseBody = require('koa-body')();
var parseMultipart = require('koa-body')({formidable: {uploadDir: __dirname + '/..'}, multipart: true});

var companion = require('./../controllers/companion');

router.get('/', function *() {
    this.body = 'hello world';
});
router.post('/companions', parseBody, companion.create);
router.get('/companions', companion.list);
router.get('/companions/:idCompanion', companion.getById);
router.post('/companion/import', parseMultipart, companion.importCompanion);

app.use(router.routes());