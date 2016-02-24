/**
 * Created by nana on 07/02/2016.
 */

import * as db from '../models/data_models';

function *create() {
    const body = this.request.body;
    this.assert(body.companion && body.taskInProgress && body.date, 400, 'missing params');

    let date, task;

    try {
        date = body.date.split(':');
        this.assert(date.length === 3, 400, 'date wrong format');
        date = date.map(n => parseInt(n));
    } catch (e) {
        this.throw(400, 'date wrong format');
    }
    try {
        yield db.Companion.findById(body.companion).exec();
    } catch (e) {
        this.throw(400, 'user does not exist');
    }
    try {
        yield db.Task.findById(body.taskInProgress).exec();
    } catch (e) {
        this.throw(400, 'task does not exist');
    }

    let history = yield db.History.findOne({companion: body.companion}).exec();
    if (!history) history = {};
    history.companion = body.companion;
    history.taskInProgress = body.taskInProgress;
    history.date = new Date(date[0], date[1] - 1, date[2]);
    history.duration = body.duration;
    if (history._id) history = yield history.save();
    else history = yield db.History.create(history);

    this.body = history;
}

function *getRange() {
    const body = this.request.body;

    let from, to;

    try {
        from = body.from.split(':');
        to = body.to.split(':');
        this.assert(from.length === 3 && to.length === 3, 400, 'date wrong format');
        from = from.map(n => parseInt(n));
        to = to.map(n => parseInt(n));
    } catch (e) {
        this.throw(400, 'date wrong format');
    }
    this.body = yield db.History.find({
        date: {
            '$gte': new Date(from[0], from[1] - 1, from[2]),
            '$lte': new Date(to[0], to[1] - 1, to[2])
        }
    }).exec();
}

export default {create, getRange};