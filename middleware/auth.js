/**
 * Created by nana on 05/12/2015.
 */

var auth = require('basic-auth');
var bcrypt = require('bcrypt-nodejs');

var db = require('../models/data_models');

exports.webApp = webApp;
exports.bracelet = bracelet;

function *webApp(next) {
    var user = auth(this);
    this.assert(user, 401, 'token not found');
    this.user = yield db.Companion.findOne({username: user.name}, 'password').exec();
    this.assert(this.user, 401, 'user not found');
    this.assert(bcrypt.compareSync(user.pass, this.user.password), 401, 'wrong password');
    yield next;
}

function *bracelet(next) {
    this.assert(this.request.headers.authorization, 401, 'idBracelet not found');
    var idBracelet = this.request.headers.authorization;
    this.user = yield db.Companion.findOne({bracelet: idBracelet});
    this.assert(this.user, 401, 'user not found');
    yield next;
}