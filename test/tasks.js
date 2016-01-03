/**
 * Created by nana on 03/01/2016.
 */

var request = require('supertest');
var assert = require('assert');
var mongoose = require('mongoose');

var app = require('../app.js');
require('../index');
var server = app.listen();
request = request.agent(server);

describe('Tasks', function () {
    it('POST /tasks should return 400', function (done) {
        request
            .post('/tasks')
            .expect('Content-Length', 14)
            .expect(400, done);
    });

    it('POST /tasks should return 200', function (done) {
        request
            .post('/tasks')
            .send({
                name: 'newTask'
            })
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.name === 'newTask');
                this.idTask = res.body._id;
                done();
            }.bind(this));
    });

    it('GET /tasks should return 200', function (done) {
        request
            .get('/tasks')
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body[0].name === 'newTask');
                done();
            });
    });

    it('GET /tasks/close should return 200', function (done) {
        request
            .get('/tasks/close')
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.length === 0);
                done();
            });
    });

    it('PUT /tasks/:idTask should return 400', function (done) {
        request
            .put('/tasks/' + 123)
            .expect('Content-Length', 19)
            .expect(400, done);
    });

    it('PUT /tasks/:idTask should return 200', function (done) {
        request
            .put('/tasks/' + this.idTask)
            .send({
                name: 'newTaskUpdate'
            })
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.name === 'newTaskUpdate');
                done();
            });
    });

    it('DELETE /tasks/:idTask should return 400', function (done) {
        request
            .del('/tasks/' + 123)
            .expect('Content-Length', 19)
            .expect(400, done);
    });

    it('DELETE /tasks/:idTask should return 200', function (done) {
        request
            .del('/tasks/' + this.idTask)
            .expect(200, done);
    });

    it('POST /tasks/import should return 200', function (done) {
        request
            .post('/tasks/import')
            .attach('my_file', __dirname + '/xlsx/tasks.xlsx')
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.length !== 0);
                done();
            });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection('tasks', function (err) {
            if (err) done(err);
            done();
        })
    });
});