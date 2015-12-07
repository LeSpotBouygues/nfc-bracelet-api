/**
 * Created by nana on 05/12/2015.
 */

var request = require('supertest');
var mongoose = require('mongoose');

var app = require('../app.js');
require('../index');
var server = app.listen();
request = request.agent(server);

describe('Companions', function () {
    it('POST /companions should 400', function (done) {
        request
            .post('/companions')
            .expect('Content-Type', 'text/plain; charset=utf-8')
            .expect(400, done);
    });

    it('POST /companions should 200', function (done) {
        request
            .post('/companions')
            .send({
                name: 'lol',
                username: 'lol'
            })
            .expect(200, done);
    });

    it('POST /companions should 409', function (done) {
        request
            .post('/companions')
            .send({
                name: 'companion2',
                username: 'lol'
            })
            .expect(409, done);
    });

    it('GET /companions should return 200', function (done) {
        request
            .get('/companions')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done);
    });
});

after(function (done) {
    mongoose.connection.db.dropCollection('companions', function (err) {
        if (err) done(err);
        done();
    })
});