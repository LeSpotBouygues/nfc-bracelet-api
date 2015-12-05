/**
 * Created by nana on 05/12/2015.
 */
var app = require('../app.js');
var router = require('koa-router')();

var auth = require('./../middleware/auth');

var Companion = require('../controllers/companion');

router.post('/login', auth.webApp, Companion.createToken);
router.post('/loginWithBracelet', auth.bracelet, Companion.createToken);

app.use(router.routes());
