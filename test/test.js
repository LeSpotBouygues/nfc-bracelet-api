/**
 * Created by superphung on 11/27/15.
 */

var request = require('supertest');

var app = require('../app.js');

describe('test koa connection', function () {
    it('should return code 200', function (done) {
        request(app.listen())
            .get('/')
            .expect(200, done);
    });
});