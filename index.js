/**
 * Created by superphung on 11/28/15.
 */
require('babel-core/register');
require('babel-polyfill');

var app = require('./app');
var logger = require('koa-logger');

app.use(logger());

require('./routes/login');
require('./routes/companion');
require('./routes/task');

app.listen(process.env.PORT || 3000);