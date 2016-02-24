/**
 * Created by nana on 11/12/2015.
 */

import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import zlib from 'zlib';

import AWS from '../config/aws';
import * as db from '../models/data_models';

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

function Workbook() {
    if(!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
}

function fill(ws, value, type, row, col) {
    const cell = {v: value, t: type};
    const cell_ref = xlsx.utils.encode_cell({r: row, c: col});
    ws[cell_ref] = cell;
}

function getISOdate(date) {
    const year = date.getFullYear().toString();
    let month = date.getMonth();
    let day = date.getDate();

    if (month < 10) month = '0' + date.getMonth().toString();
    else month = month.toString();

    if (day < 10) day = '0' + date.getDate().toString();
    else day = day.toString();

    return year + month + day;
}

function fillSheet(history, start, end) {
    const header = [
        'Référentiel maitre données Pré-pointage',
        'Code Nature Enregistrement',
        'Composantes de pré-pointage envoyées',
        'Date de Début Amplitude',
        'Date de fin Amplitude',
        'Référentiel Maitre des Sociétés juridiques',
        'Code Société Juridique'
    ];

    const headerTIA = [
        'Référentiel maitre données Pré-pointage',
        'Code Nature Enregistrement',
        'Référenciel maitre Ressource',
        'Catégorie ressource',
        'Code Ressource',
        'Référenciel maitre Finance',
        'Code interne Tâche',
        'Pré-pointage',
        'Valeur'
    ];

    var ws = {};

    header.forEach(function (label, index) {
        fill(ws, label, 's', 0, index);
    });
    fill(ws, history[0].companion.refPrevPoint, 's', 1, 0);
    fill(ws, 'ENT', 's', 1, 1);
    fill(ws, 'TIA', 's', 1, 2);
    fill(ws, getISOdate(start), 's', 1, 3);
    fill(ws, getISOdate(end), 's', 1, 4);
    fill(ws, history[0].companion.refCompany, 's', 1, 5);
    fill(ws, history[0].companion.refCompanyCode, 's', 1, 6);

    headerTIA.forEach(function (label, index) {
        fill(ws, label, 's', 3, index)
    });

    history.forEach(function (h, index) {
        if (!h.date) return;
        const row = 4+index;

        fill(ws, h.companion.refPrevPoint, 's', row, 0);
        fill(ws, 'TIA', 's', row, 1);
        fill(ws, h.companion.refResource, 's', row, 2);
        fill(ws, h.companion.category, 's', row, 3);
        fill(ws, h.companion.idPayrol, 's', row, 4);
        //fill(ws, h.companion.refCompany, 's', row, 5);
        fill(ws, h.taskInProgress.code, 's', row, 6);
        fill(ws, getISOdate(h.date), 's', row, 7);
        fill(ws, h.duration, 'n', row, 8);
    });

    ws['!ref'] = xlsx.utils.encode_range({s: {r: 0, c: 0}, e: {r: 3+history.length, c: 8}});
    return ws;
}

function *exportPointage() {
    const body = this.request.body;

    this.assert(body.start && body.end, 400, 'missing params');

    let start, end;
    try {
        start = body.start.split(':');
        end = body.end.split(':');
        this.assert(start.length === 3, 400, 'wrong format');
        this.assert(end.length === 3, 'wrong format');
        start = start.map(n => parseInt(n));
        end = end.map(n => parseInt(n));
    } catch (e) {
        this.throw(400, 'wrong format');
    }
    start = new Date(start[0], start[1] - 1, start[2]);
    end = new Date(end[0], end[1] - 1, end[2]);

    const hist = yield db.History.find({
        date: {
            '$gte': start,
            '$lte': end
        }})
        .populate('companion', 'idPayrol refPrevPoint refResource category refCompany refCompanyCode')
        .populate('taskInProgress')
        .exec();

    this.assert(hist.length !== 0, 204);

    const societeJ = [];

    hist.forEach(h => {
        if (!h.companion) return;
        let {refCompany, refCompanyCode, refPrevPoint} = h.companion;
        for (let i=0; i < societeJ.length; i++) {
            if (societeJ[i].refCompany === refCompany &&
                societeJ[i].refCompanyCode === refCompanyCode &&
                societeJ[i].refPrevPoint === refPrevPoint) return;
        }
        societeJ.push({refCompany, refCompanyCode, refPrevPoint});
    });

    const histFiltered = [];
    societeJ.forEach((s,idx) => {
        histFiltered[idx] = hist.filter(h => {
            if (!h.companion) return false;
            return s.refCompany === h.companion.refCompany
                && s.refCompanyCode === h.companion.refCompanyCode
                && s.refPrevPoint === h.companion.refPrevPoint;
        });
    });

    const urls = [];
    histFiltered.forEach((h,idx) => {
        const ws_name = "SheetJS" + idx;
        const wb = new Workbook(), ws = fillSheet(h, start, end);
        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;
        xlsx.writeFile(wb, idx + '.xlsx', {bookType:'xlsx', bookSST:true, type: 'binary'});
        let S3body = fs.createReadStream(idx + '.xlsx');
        const key = new Date().getTime().toString() + '.xlsx';
        let S3 = new AWS.S3({
            params: {
                Bucket: 'bouygues-csv',
                Key: key
            }
        });
        S3.upload({Body: S3body}).
        on('httpUploadProgress', function(evt) { console.log(evt); }).
        send(function(err, data) { console.log(err, data) });
        urls.push('https://s3-eu-west-1.amazonaws.com/bouygues-csv/' + key);
    });
    this.body = {urls};
}

export default {parse, exportPointage, getWorksheet};