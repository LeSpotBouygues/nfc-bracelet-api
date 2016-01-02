/**
 * Created by nana on 11/12/2015.
 */

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

export default {getWorksheet};