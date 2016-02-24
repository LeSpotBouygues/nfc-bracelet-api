/**
 * Created by nana on 11/12/2015.
 */

import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

import file from '../middleware/file';
import * as db from '../models/data_models.js';

function *create() {
    const body = this.request.body;
    this.body = yield db.Task.create(body);
}

function *createFromFile() {
    yield db.Task.remove();
    this.body = yield db.Task.create(this.parseData);
}

function *list() {
    this.body = yield db.Task.find().exec();
}

function *getList() {
    var AllProjects = yield db.Task.find({niv: 1, open: true}).exec();
    var tasks = yield db.Task.find().exec();

    var data = [];

    AllProjects.forEach(function (Project, index) {
        data.push(Project);
        if (Project.code) data[index].child = getNestedChildren(tasks, Project.code, true);
    });

    this.body = data;
}

function *listClose() {
    this.body = yield db.Task.find({open: false}).exec();
}

function *listAffected() {
    let team;
    try {
        team = yield db.Team.findOne({chief: this.params.idChief}).populate('tasks').exec();
    } catch (err) {}
    this.assert(team, 400, 'chief does not have team');
    this.body = team.tasks;
}

function *listInProgress() {
    let team;
    try {
        team = yield db.Team.findOne({chief: this.params.idChief}).populate('companions').exec();
    } catch (err) {}
    this.assert(team, 400, 'chief does not have team');
    const promises = yield team.companions.map(companion => {
       return new Promise(function (resolve, reject) {
           db.Task.populate(companion, {path: 'tasksInProgress'}, function (err, data) {
               if (err) reject(err);
               else resolve(data.tasksInProgress);
           });
       });
    });
    this.body = [].concat.apply([], promises);
}

function *update() {
    const body = this.request.body;
    let task;
    const labels = ['parent', 'code', 'name', 'niv', 'open', 'label_short', 'label_long', 'master', 'masterCode'];
    try {
        task = yield db.Task.findById(this.params.idTask).exec();
    } catch (err) {}
    this.assert(task, 400, 'task does not exist');
    labels.forEach(label => {
        if (body[label]) task[label] = body[label];
    });
    this.body = yield task.save();
}

function *del() {
    let task;
    try {
        task = yield db.Task.findById(this.params.idTask);
    } catch (err) {}
    this.assert(task, 400, 'task does not exist');
    this.body = yield db.Task.remove({_id : this.params.idTask}).exec();
}

export default {create, createFromFile, list, getList, listClose, listAffected, listInProgress, update, del};

function getNestedChildren(arr, parent, isOpen) {
    var out = [];
    for(var i in arr) {
        if(arr[i].parent == parent && arr[i].open === isOpen) {
            var children = getNestedChildren(arr, arr[i].code, isOpen);

            if(children.length) {
                arr[i].child = children
            }
            out.push(arr[i])
        }
    }
    return out
}