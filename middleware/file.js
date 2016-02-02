/**
 * Created by nana on 11/12/2015.
 */

import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

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

function parse(labels, start) {
    return function *(next) {
        try {
            var filename = path.basename(this.request.body.files['my_file'].path);
            var worksheet = yield getWorksheet(filename);
        } catch (e) {
            fs.unlinkSync(this.request.body.files['my_file'].path);
            this.throw(500, 'fail read file during import');
        }

        const data = [];
        const pos = {};

        for (const cell_ref in worksheet) {
            let cell;
            let value;

            if (cell_ref[0] === '!') continue;

            cell = worksheet[cell_ref];
            if (typeof  cell.v === 'string') value = cell.v.trim().replace(/\s+/g, " ").toLowerCase();
            else value = cell.v;

            if (indexOf(value) != -1) pos[value] = cell_ref[0];
            else if (cell_ref[0] === pos[start]) {
                const obj = {};
                const y = cell_ref.substr(1);

                for (const label in labels) {
                    if (pos[label] && worksheet[pos[label] + y]) {
                        obj[getLabel(label)] = getData(worksheet[pos[label] + y]);
                    }
                }
                data.push(obj);
            }
        }
        fs.unlinkSync(this.request.body.files['my_file'].path);
        this.parseData = data;
        yield next;
    };

    function indexOf(value) {
        for (const label in labels) {
            if (label === value) return true;
        }
        return -1;
    }

    function getLabel(key) {
        return labels[key];
    }

    function getData(obj) {
        return (typeof obj.v === 'string') ? obj.v.trim() : obj.v;
    }
}

export default {parse, getWorksheet};