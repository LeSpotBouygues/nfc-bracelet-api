/**
 * Created by superphung on 11/29/15.
 */
var jwt = require('jwt-simple');

var db = require('../models/data_models');

exports.create = create;
exports.createToken = createToken;
exports.list = list;

function *create() {
    var body = this.request.body;
    this.assert(body.name, 400, 'missing params');
    try {
        var user = yield db.Companion.create(this.request.body);
    } catch (err) {
        if (err.code === 11000) this.throw(409, 'duplicate user');
    }
    this.body = user;
}

function *createToken() {
    var payload = {
        sub: this.user._id
    };
    var token = jwt.encode(payload, 'secret');
    this.body = {
        token: token
    };
}

function *list() {
    this.body = yield db.Companion.find().exec();
}