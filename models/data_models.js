/**
 * Created by superphung on 11/29/15.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const companionSchema = mongoose.Schema({
    name: {type: String},
    bracelet: {type: String},
    username: {type: String},
    password: {type: String, select: false},
    company: {type: String},
    position: {type: String},
    tasksInProgress: [{type: mongoose.Schema.Types.ObjectId, ref: 'Task'}]
});

const taskSchema = mongoose.Schema({
    project: {type: String},
    parent: {type: String},
    code: {type: String},
    name: {type: String},
    niv: {type: Number, default: 1},
    child: {type: Array},
    open: {type: Boolean, default: true}
});

const teamSchema = mongoose.Schema({
    name: {type: String},
    chief: {type: mongoose.Schema.Types.ObjectId, ref: 'Companion'},
    companions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Companion'}],
    tasks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Task'}]
});

const Companion = mongoose.model('Companion', companionSchema);
const Task = mongoose.model('Task', taskSchema);
const Team = mongoose.model('Team', teamSchema);

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

export {Companion, Task, Team};