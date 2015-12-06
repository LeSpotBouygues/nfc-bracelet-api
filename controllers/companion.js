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
    if (body.username) {
        var companion = yield db.Companion.findOne({username: body.username}).exec();
        this.assert(!companion, 409, 'duplicate user');
    }
    this.body = yield db.Companion.create(body);
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