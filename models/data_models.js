/**
 * Created by superphung on 11/29/15.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var companionSchema;
var taskSchema;

companionSchema = mongoose.Schema({
    name: {type: String},
    chief: {type: Boolean, default: false},
    bracelet: {type: String},
    username: {type: String},
    password: {type: String, select: false},
    company: {type: String},
    position: {type: String}
});

taskSchema = mongoose.Schema({
    project: {type: String},
    parent: {type: String},
    code: {type: String},
    name: {type: String},
    niv: {type: Number},
    child: {type: Array}
});

var Companion = mongoose.model('Companion', companionSchema);
var Task = mongoose.model('Task', taskSchema);

Companion.schema.pre('save', function (next) {
    var user = this;

    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, function (err, salt) {
        if (err) next(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

exports.Companion = Companion;
exports.Task = Task;