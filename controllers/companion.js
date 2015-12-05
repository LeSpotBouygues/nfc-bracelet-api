/**
 * Created by superphung on 11/29/15.
 */
var db = require('../models/data_models');

exports.list = list;

function *list() {
    this.body = yield db.Campanion.find().exec();
}