/**
 * Created by superphung on 11/27/15.
 */
var koa = require('koa');
var app = module.exports = koa();

app.use(function *() {
    this.body = 'hello world';
});
