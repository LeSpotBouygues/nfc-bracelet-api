/**
 * Created by nana on 07/02/2016.
 */

import * as db from '../models/data_models';

function *create() {
    const body = this.request.body;
    this.assert(body.companion && body.taskInProgress && body.date, 400, 'missing params');
    this.assert(body.taskInProgress instanceof Array, 400, 'task must be array');

    let date, companion, task;

    try {
        date = body.date.split(':');
        this.assert(date.length === 3, 400, 'date wrong format');
        date = date.map(n => parseInt(n));
        date = new Date(date[0], date[1] - 1, date[2]);
    } catch (e) {
        this.throw(400, 'date wrong format');
    }

    try {
        companion = yield db.Companion.findById(body.companion).exec();
    } catch (e) {}
    this.assert(companion, 400, 'user does not exist');

    try {
        task = yield db.Task.find({_id: {$in: body.taskInProgress.map(t => t.id)}}).exec();
    } catch (e) {}
    this.assert(task, 400, 'task does not exist');

    const toCreate = body.taskInProgress.filter(t => {
        for (let i=0; i < task.length; i++) {
            if (JSON.stringify(t.id) === JSON.stringify(task[i]._id)) return true;
        }
        return false;
    });
    yield db.History.find({companion: body.companion, date}).remove().exec();

    this.body = yield db.History.create(toCreate.map(t => {
        return {
            companion: body.companion,
            date,
            taskInProgress: t.id,
            duration: t.duration
        };
    }));
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