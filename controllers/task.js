/**
 * Created by nana on 11/12/2015.
 */

var fs = require('fs');
var path = require('path');
var xlsx = require('xlsx');

var db = require('../models/data_models.js');

exports.getList = getList;
exports.importTask = importTask;

function getNestedChildren(arr, parent) {
    var out = [];
    for(var i in arr) {
        if(arr[i].parent == parent) {
            var children = getNestedChildren(arr, arr[i].code);

            if(children.length) {
                arr[i].child = children
            }
            out.push(arr[i])
        }
    }
    return out
}

function *getList() {
    var AllProjects = yield db.Task.find({niv: 1}).exec();
    var tasks = yield db.Task.find().exec();

    var data = [];

    AllProjects.forEach(function (Project, index) {
        data.push(Project);
        data[index].child = getNestedChildren(tasks, Project.code);
    });

    this.body = data;
}

function *importTask() {
    var name = this.xlsxFile.toString();

    var workbook = xlsx.readFile(name);
    var fileName = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[fileName];

    var pos = {};
    var data = [];

    for (cell in worksheet) {
        if (cell[0] === '!') continue;
        var value = worksheet[cell].v.trim();
        if (value === 'Définition de projet' ||
            value === 'Elément d\'OTP' ||
            value === 'Désignation' ||
            value === 'Niv.') pos[value] = cell[0];
        else if (cell[0] === pos['Définition de projet']) {
            var task = {};
            var y = cell.substr(1);
            task.projet = value;
            task.code = worksheet[pos['Elément d\'OTP'] + y].v.trim();
            task.name = worksheet[pos['Désignation'] + y].v.trim();
            task.niv = parseInt(worksheet[pos['Niv.'] + y].v.trim());

            if (task.niv !== 1) {
                var index = task.code.lastIndexOf('.');
                task.parent = task.code.substring(0, index);
            }
            data.push(task);
        }
    }
    yield db.Task.remove();
    this.body = yield db.Task.create(data);
}