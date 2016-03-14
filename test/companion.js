/**
 * Created by nana on 05/12/2015.
 */

var request = require('supertest');
var assert = require('assert');
var mongoose = require('mongoose');



var app = require('../app.js');
require('../index');
var db = require('../models/data_models');
var server = app.listen();
request = request.agent(server);

var dataTask = [
    {
        label_short: 'task1'
    }
];

describe('Companions', function () {
    before(function (done) {
        db.Task.create(dataTask, function (err, res) {

            if (err) done(err);
            this.task = res[0];
            done();
        }.bind(this));
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
            .expect(200)
            .end(function (err, res) {
                this.id = res.body[0]._id;
                done(err);
            }.bind(this));
    });

    it('GET /companions/:idCompanion should return 200', function (done) {
        request
            .get('/companions/' + this.id)
            .expect(200, done);
    });

    it('GET /companions/:idCompanion should return 204', function (done) {
        request
            .get('/companions/123')
            .expect(204, done);
    });

    it('GET /companions/:name/name should return 200', function (done) {
        request
            .get('/companions/lol/name')
            .expect(200, done);
    });

    it('PUT /companions/:idCompanion/addTask should return 400', function (done) {
        request
            .put('/companions/' + 123 + '/addTask')
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'missing params');
                done();
            });
    });

    it('PUT /companions/:idCompanion/addTask should return 400', function (done) {
        request
            .put('/companions/' + 123 + '/addTask')
            .send({
                task: '123'
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'companion does not exist');
                done();
            });
    });

    it('PUT /companions/:idCompanion/addTask should return 400', function (done) {
        request
            .put('/companions/' + this.id + '/addTask')
            .send({
                task: '123'
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'task does not exist');
                done();
            });
    });

    it('PUT /companions/:idCompanion/addTask should return 200', function (done) {
        request
            .put('/companions/' + this.id + '/addTask')
            .send({
                task: this.task._id
            })
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.tasksInProgress[0] == this.task._id);
                done();
            }.bind(this));
    });

    it('PUT /companions/:idCompanion/addTask should return 400', function (done) {
        request
            .put('/companions/' + this.id + '/addTask')
            .send({
                task: this.task._id
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'task already in the companion');
                done()
            });
    });
    //////
    it('PUT /companions/:idCompanion/removeTask should return 400', function (done) {
        request
            .put('/companions/' + 123 + '/removeTask')
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'missing params');
                done();
            });
    });

    it('PUT /companions/:idCompanion/removeTask should return 400', function (done) {
        request
            .put('/companions/' + 123 + '/removeTask')
            .send({
                task: '123'
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'companion does not exist');
                done();
            });
    });

    it('PUT /companions/:idCompanion/removeTask should return 400', function (done) {
        request
            .put('/companions/' + this.id + '/removeTask')
            .send({
                task: '123'
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'task does not exist');
                done();
            });
    });

    it('PUT /companions/:idCompanion/removeTask should return 200', function (done) {
        request
            .put('/companions/' + this.id + '/removeTask')
            .send({
                task: this.task._id
            })
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.tasksInProgress.length == 0);
                done();
            }.bind(this));
    });

    it('PUT /companions/:idCompanion/removeTask should return 400', function (done) {
        request
            .put('/companions/' + this.id + '/removeTask')
            .send({
                task: this.task._id
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'task is not in the companion');
                done()
            });
    });

    it('UPDATE /companions/:idCompanion should return 200', function (done) {
        request
            .put('/companions/' + this.id)
            .send({
                firstName: 'updateName'
            })
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.firstName === 'updateName');
                done();
            });
    });

    it('UPDATE /companions/:idCompanion should return 400', function (done) {
        request
            .put('/companions/' + 123)
            .expect('Content-Length', 19)
            .expect(400, done);
    });

    it('POST /companions/import should return 200', function (done) {
        request
            .post('/companions/importData')
            .attach('my_file', __dirname + '/xlsx/lastCompanions.xlsx')
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.length !== 0);
                done();
            });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection('companions', function (err) {
            if (err) done(err);
            mongoose.connection.db.dropCollection('tasks', function (err) {
                if (err) done(err);
                done();
            });
        });
    });
});
