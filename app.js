/**
 * Created by superphung on 11/27/15.
 */
var koa = require('koa');
var mongoose = require('mongoose');

module.exports = koa();
if (process.env.ENV === 'dev') mongoose.connect('mongodb://localhost/nfc-api-testingDB');
else mongoose.connect('mongodb://localhost/nfc-api-db');
