/**
 * Created by nana on 11/12/2015.
 */

var parse = require('co-busboy');
var fs = require('fs');
var path = require('path');
var xlsx = require('xlsx');

exports.setListTask = setListTask;
exports.get = get;
exports.getWorksheet = getWorksheet;

function *setListTask(next){
    this.fileType = 'task';
    yield next;
}

function *get(next) {
    var parts = parse(this, {
        checkFile: function (fieldname, file, filename) {
            if (path.extname(filename) !== '.xlsx') {
                var err = new Error('invalid xlsx file');
                err.status = 400;
                return err;
            }
        }
    });

    var part;
    var filename;

    if (this.fileType === 'task') filename = 'taches.xlsx';
    if (this.fileType === 'companion') filename = 'companions.xlsx';

    while(part = yield parts) {
        part.pipe(fs.createWriteStream(filename));
        this.xlsxFile = filename;
    }
    yield next;
}

function getWorksheet(filename) {
    return function (done) {
        try {
            var workbook = xlsx.readFile(filename);
        } catch (err) {
            return done(err);
        }
        var fileName = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[fileName];
        return done(null, worksheet);
    }
}