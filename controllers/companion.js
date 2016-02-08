/**
 * Created by superphung on 11/29/15.
 */
import fs from 'fs';
import path from 'path';
import jwt from 'jwt-simple';

import file from '../middleware/file';
import * as db from '../models/data_models';

function *create() {
    var body = this.request.body;
    if (body.username) {
        var companion = yield db.Companion.findOne({username: body.username}).exec();
        this.assert(!companion, 409, 'duplicate user');
    }
    this.body = yield db.Companion.create(body);
}

function *createFromFile() {
    yield db.Companion.remove();
    this.body = yield db.Companion.create(this.parseData);
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

function *update() {
    const body = this.request.body;
    let companion;
    const labels = ['firstName', 'lastName', 'bracelet', 'username', 'password', 'company', 'position'];
    try {
        companion = yield db.Companion.findById(this.params.idCompanion).exec();
    } catch (err) {}
    this.assert(companion, 400, 'user does not exist');
    labels.forEach(label => {
        if (body[label]) companion[label] = body[label];
    });
    this.body = yield companion.save();
}

export default {create, createFromFile, createToken, list, getById, getByName, update};
