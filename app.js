/**
 * Created by superphung on 11/27/15.
 */
var koa = require('koa');
var mongoose = require('mongoose');

module.exports = koa();
mongoose.connect('mongodb://localhost/nfc-api-db');
