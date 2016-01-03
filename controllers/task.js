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
    this.assert(body.name, 400, 'missing params');
    this.body = yield db.Task.create(body);
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

function *update() {
    const body = this.request.body;
    let task;
    const labels = ['project', 'parent', 'code', 'name', 'niv', 'open'];
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

function *importTask() {

    try {
        var filename = path.basename(this.request.body.files['my_file'].path);
        var worksheet = yield file.getWorksheet(filename);
    } catch (e) {
        fs.unlinkSync(this.request.body.files['my_file'].path);
        this.throw(500, 'fail read file during import');
    }

    var labels = ['Définition de projet', 'Elément d\'OTP', 'Désignation', 'Niv.'];
    var pos = {};
    var data = [];

    for (const cell in worksheet) {
        if (cell[0] === '!') continue;
        var value = worksheet[cell].v.trim();
        var idx = labels.indexOf(value);

        if (idx !== -1) pos[value] = cell[0];
        else if (cell[0] === pos['Définition de projet']) {
            var task = {};
            var y = cell.substr(1);
            task.projet = value;
            task.code = pos['Elément d\'OTP']  ? worksheet[pos['Elément d\'OTP'] + y].v.trim() : '';
            task.name = pos['Désignation'] ? worksheet[pos['Désignation'] + y].v.trim() : '';
            task.niv = pos['Niv.'] ? parseInt(worksheet[pos['Niv.'] + y].v.trim()) : '';

            if (task.niv !== 1) {
                var index = task.code.lastIndexOf('.');
                task.parent = task.code.substring(0, index);
            }
            data.push(task);
        }
    }
    fs.unlinkSync(this.request.body.files['my_file'].path);
    yield db.Task.remove();
    this.body = yield db.Task.create(data);
}

export default {create, getList, listClose, update, del, importTask};

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