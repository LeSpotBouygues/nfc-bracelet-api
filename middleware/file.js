/**
 * Created by nana on 11/12/2015.
 */

import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import zlib from 'zlib';
import archiver from 'archiver';

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

function fillCsv(history, start, end) {
    let template =
        getData(history[0].companion.refPrevPoint) + '¤¤' +
        'ENT¤¤' +
        'TIA¤¤' +
        getISOdate(start) + '¤¤' +
        getISOdate(end) + '¤¤' +
        getData(history[0].companion.refCompany) + '¤¤' +
        getData(history[0].companion.refCompanyCode) + '¤¤¤¤¤¤¤¤¤¤\n';
    history.forEach(h => {
        if (!h.date) return;
        template +=
            getData(h.companion.refPrevPoint) + '¤¤' +
            'TIA¤¤' +
            getData(h.companion.refResource) + '¤¤' +
            getData(h.companion.category) + '¤¤' +
            getData(h.companion.idPayrol) + '¤¤' +
            getISOdate(h.date) + '¤¤' +
            'EDIFICE¤¤' +
            getData(h.taskInProgress.code) + '¤¤' +
            getData(h.duration) + '¤¤¤¤¤¤\n';
    });
    return template;

    function getData(data) {
        return data ? data : '¤¤';
    }
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
        .populate('companion', 'idPayrol firstName lastName refPrevPoint refResource category refCompany refCompanyCode')
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

    const files = [];
    histFiltered.forEach((h) => {
        const file = `${h[0].companion.refCompany}.csv`;
        files.push(file);
        fs.writeFileSync(file, fillCsv(h, start, end));
    });
    const zip = `pre-pointage-${Date.now().toString()}.zip`;
    const output = fs.createWriteStream(zip);
    const archive = archiver('zip');
    
    archive.pipe(output);
    files.forEach(f => archive.append(fs.createReadStream(f), {name : f}));
    archive.finalize();

    output.on('close', () => {
        files.forEach(f => fs.unlinkSync(f));
        let S3 = new AWS.S3({
            params: {
                Bucket: 'bouygues-csv',
                Key: zip
            }
        });
        S3.upload({Body: fs.createReadStream(zip)}, () => fs.unlinkSync(zip));
    });

    this.body = {url: 'https://s3-eu-west-1.amazonaws.com/bouygues-csv/' + zip, histories: histFiltered};
}

export default {parse, exportPointage, getWorksheet};