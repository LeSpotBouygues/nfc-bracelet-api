/**
 * Created by superphung on 11/29/15.
 */
var fs = require('fs');
var path = require('path');
var jwt = require('jwt-simple');

var file = require('../middleware/file');
var db = require('../models/data_models');

exports.create = create;
exports.createToken = createToken;
exports.list = list;
exports.getById = getById;
exports.getByName = getByName;
exports.importCompanion = importCompanion;

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

function *getById() {
    try {
        var companion = yield db.Companion.findById(this.params.idCompanion).exec();
    } catch (err) {
    }
    this.body = companion;
}

function *getByName() {
    var nameCandidate = new RegExp('\^' + this.params.name, 'i');
    this.body = yield db.Companion.find({name: nameCandidate}).exec();
}

function *importCompanion() {

    try {
        var filename = path.basename(this.request.body.files['my_file'].path);
        var worksheet = yield file.getWorksheet(filename);
    } catch (e) {
        fs.unlinkSync(this.request.body.files['my_file'].path);
        this.throw(500, 'fail read file during import');
    }

    var labels = ['NAME\'S', 'COMPANY NAME\'S', 'POSITION & TOTAL ARRIVAL'];
    var pos = {};
    var data = [];

    for (cell in worksheet) {
        var value;

        if (cell[0] === '!') continue;

        if (typeof  worksheet[cell].v === 'string') value = worksheet[cell].v.trim().replace(/\s+/g, " ");
        else value = worksheet[cell].v;

        var idx = labels.indexOf(value);
        if (idx != -1) pos[value] = cell[0];
        else if (cell[0] === pos['NAME\'S']) {
            var companion = {};
            var y = cell.substr(1);
            companion.name = value;
            if (pos['COMPANY NAME\'S'] && worksheet[pos['COMPANY NAME\'S'] + y]) {
                if (typeof worksheet[pos['COMPANY NAME\'S'] + y].v === 'string') companion.company = worksheet[pos['COMPANY NAME\'S'] + y].v.trim();
                else companion.company = worksheet[pos['COMPANY NAME\'S'] + y].v;
            } else companion.company = '';

            if (pos['POSITION & TOTAL ARRIVAL'] && worksheet[pos['POSITION & TOTAL ARRIVAL'] + y]) {
                if (typeof worksheet[pos['POSITION & TOTAL ARRIVAL'] + y].v === 'string') companion.position = worksheet[pos['POSITION & TOTAL ARRIVAL'] + y].v.trim();
                else companion.position = worksheet[pos['POSITION & TOTAL ARRIVAL'] + y].v;
            } else companion.position = '';

            data.push(companion);
        }
    }

    fs.unlinkSync(this.request.body.files['my_file'].path);
    yield db.Companion.remove();
    this.body = yield db.Companion.create(data);
}