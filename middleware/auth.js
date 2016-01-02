/**
 * Created by nana on 05/12/2015.
 */

import auth from 'basic-auth';
import bcrypt from 'bcrypt-nodejs';

import * as db from '../models/data_models';

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

export default {webApp, bracelet};