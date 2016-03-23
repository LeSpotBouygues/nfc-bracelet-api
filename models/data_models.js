/**
 * Created by superphung on 11/29/15.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const companionSchema = mongoose.Schema({
    idPayrol: {type: String, select: false},
    idBYCN: {type: String, select: false},
    idBracelet: {type:String},
    chief: {type: Boolean, default: false},
    firstName: {type: String},
    lastName: {type: String},
    aliasName: {type: String},
    bracelet: {type: String},
    username: {type: String},
    password: {type: String, select: false},
    nationality: {type: String},
    company: {type: String},
    category: {type: String},
    position: {type: String},
    workPermit: {type: String},
    tasksInProgress: [{type: mongoose.Schema.Types.ObjectId, ref: 'Task'}],
    expirationDate: {type: Date},
    vacationStart: {type: Date},
    vacationEnd: {type: Date},
    refPrevPoint: {type: String},
    refResource: {type: String},
    refCompany: {type: String},
    refCompanyCode: {type: String}

});

const taskSchema = mongoose.Schema({
    code: {type: String},
    label_short: {type: String},
    label_long: {type: String},
    parent: {type: String},
    niv: {type: Number},
    master: {type: String},
    masterCode: {type: String},
    open: {type: Boolean, default: true},
    child: {type: Array}
});

const teamSchema = mongoose.Schema({
    name: {type: String},
    chief: {type: mongoose.Schema.Types.ObjectId, ref: 'Companion'},
    companions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Companion'}],
    tasks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Task'}]
});

const historySchema = mongoose.Schema({
    companion: {type: mongoose.Schema.Types.ObjectId, ref: 'Companion'},
    taskInProgress: {type: mongoose.Schema.Types.ObjectId, ref: 'Task'},
    date: {type: Date},
    duration: {type: Number}
});

const Companion = mongoose.model('Companion', companionSchema);
const Task = mongoose.model('Task', taskSchema);
const Team = mongoose.model('Team', teamSchema);
const History = mongoose.model('History', historySchema);

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

export {Companion, Task, Team, History};