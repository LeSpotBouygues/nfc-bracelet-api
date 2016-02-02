/**
 * Created by nana on 03/01/2016.
 */

var request = require('supertest');
var assert = require('assert');
var mongoose = require('mongoose');

var db = require('../models/data_models');

var app = require('../app.js');
require('../index');
var server = app.listen();
request = request.agent(server);

var dataCompanion = [
    {
        name: 'chief'
    },
    {
        name: 'companion',
        tasksInProgress: []
    }
];

var dataTask = [
    {
        designation: 'task1'
    },
    {
        designation: 'task2'
    }
];

describe('Tasks', function () {
    before(function (done) {
        db.Companion.create(dataCompanion, function (err, companions) {
            if (err) return done(err);
            this.idChief = companions[0]._id;
            db.Task.create(dataTask, function (err, tasks) {
                if (err) return done(err);
                companions[1].tasksInProgress.push(tasks[0]._id);
                companions[1].save(function (err) {
                    if (err) return done(err);
                    var dataTeam = [{
                        chief: companions[0]._id,
                        companions: [companions[1]._id],
                        tasks: tasks.map(function (task) {
                            return task._id
                        })
                    }];
                    db.Team.create(dataTeam, function (err) {
                        if (err) return done(err);
                        done();
                    });
                });
            });
        }.bind(this));
    });

    it('POST /tasks should return 200', function (done) {
        request
            .post('/tasks')
            .send({
                designation: 'newTask'
            })
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.designation === 'newTask');
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
                done();
            });
    });

    it('GET /tasks/close should return 200', function (done) {
        request
            .get('/tasks/close')
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                done();
            });
    });

    it('GET /tasks/:idChief/affected return 400', function (done) {
        request
            .get('/tasks/' + 123 + '/affected')
            .expect(400, done);
    });

    it('GET /tasks/:idChief/affected return 200', function (done) {
        request
            .get('/tasks/' + this.idChief + '/affected')
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.length === 2);
                done();
            });
    });

    it('GET /tasks/:idChief/inProgress should return 400', function (done) {
        request
            .get('/tasks/' + 123 + '/inProgress')
            .expect(400, done);
    });

    it('GET /tasks/:idChief/inProgress should return 200', function (done) {
        request
            .get('/tasks/' + this.idChief + '/inProgress')
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.length === 1);
                assert(res.body[0].designation === 'task1');
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
                designation: 'newTaskUpdate'
            })
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.designation === 'newTaskUpdate');
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
            .post('/tasks/importData')
            .attach('my_file', __dirname + '/xlsx/newImportTasks.xlsx')
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.length !== 0);
                done();
            });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection('tasks', function (err) {
            if (err) return done(err);
            mongoose.connection.db.dropCollection('teams', function (err) {
                if (err) return done(err);
                mongoose.connection.db.dropCollection('companions', function (err) {
                    if (err) return done(err);
                    done();
                });
            });
        });
    });
});