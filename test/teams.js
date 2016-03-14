/**
 * Created by nana on 02/01/2016.
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
        name: 'chief',
        username: 'chief',
        password: 'chief'
    },
    {
        name: 'companion1'
    },
    {
        name: 'companion2'
    },
    {
        name: 'companion3'
    }
];

var dataTask = [
    {
        label_short: 'task1'
    },
    {
        label_short: 'task2'
    }
];

describe('Teams', function () {
    before(function (done) {
        db.Companion.create(dataCompanion, function (err, res) {
            var self = this;
            if (err) return done(err);
            self.Chief = res[0];
            self.companionToAdd = res[1];
            self.companions = res.slice(2).map(function (companion) {
                return companion._id;
            });
            db.Task.create(dataTask, function (err, res) {
                if (err) return done(err);
                self.task  = res[0];
                self.task2 = res[1];
                done();
            });
        }.bind(this));
    });

    it('POST /teams should return 400', function (done) {
        request
            .post('/teams')
            .expect('Content-Length', 14)
            .expect(400, done);
    });

    it('POST /teams should return 200', function (done) {
        request
            .post('/teams')
            .send({
                chief: this.Chief._id,
                companions: this.companions
            })
            .expect(200, done);
    });

    it('POST /teams should return 400', function (done) {
        request
            .post('/teams')
            .send({
                chief: this.Chief._id
            })
            .expect('Content-Length', 25)
            .expect(400, done);
    });

    it('GET /teams should return 200', function (done) {
        request
            .get('/teams')
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.length === 1);
                this.idTeam = res.body[0]._id;
                done();
            }.bind(this));
    });

    it('GET /teams/:id should return 200', function (done) {
        request
            .get('/teams/' + this.idTeam)
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body._id === this.idTeam);
                done();
            }.bind(this));
    });

    it('GET /teams/:id should return 204', function (done) {
        request
            .get('/teams/' + 123)
            .expect(204, done);
    });

    it('GET /teams/:id/companions should return 200', function (done) {
        request
            .get('/teams/' + this.idTeam + '/companions')
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.length === 2);
                done();
            });
    });

    it('GET /teams/:id/companions should return 400', function (done) {
        request
            .get('/teams/' + 123 + '/companions')
            .expect(400, done);
    });

    it('PUT /teams/:id/addCompanion should return 400', function (done) {
        request
            .put('/teams/' + 123 + '/addCompanion')
            .send({
                companion: 123
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'team does not exist');
                done();
            });
    });

    it('PUT /teams/:id/addCompanion should return 400', function (done) {
        request
            .put('/teams/' + this.idTeam + '/addCompanion')
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'missing params');
                done();
            });
    });

    it('PUT /teams/:id/addCompanion should return 400', function (done) {
        request
            .put('/teams/' + this.idTeam + '/addCompanion')
            .send({
                companion: 123
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'companion does not exist');
                done();
            });
    });

    it('PUT /teams/:id/addCompanion should return 200', function (done) {
        request
            .put('/teams/' + this.idTeam + '/addCompanion')
            .send({
                companion: this.companionToAdd._id
            })
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.companions.length === 3);
                done();
            });
    });

    it('PUT /teams/:id/addCompanion should return 400', function (done) {
        request
            .put('/teams/' + this.idTeam + '/addCompanion')
            .send({
                companion: this.companionToAdd._id
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'companion already in the team');
                done();
            });
    });

    it('PUT /teams/:id/removeCompanion should return 400', function (done) {
        request
            .put('/teams/' + 123 + '/removeCompanion')
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'missing params');
                done();
            });
    });

    it('PUT /teams/:id/removeCompanion should return 400', function (done) {
        request
            .put('/teams/' + 123 + '/removeCompanion')
            .send({
                companion: 123
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'team does not exist');
                done();
            });
    });

    it('PUT /teams/:id/removeCompanion should return 400', function (done) {
        request
            .put('/teams/' + this.idTeam + '/removeCompanion')
            .send({
                companion: 123
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'companion does not exist');
                done()
            });
    });

    it('PUT /teams/:id/removeCompanion should return 400', function (done) {
        request
            .put('/teams/' + this.idTeam + '/removeCompanion')
            .send({
                companion: this.Chief._id
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'companion is not in the team');
                done();
            });
    });

    it('PUT /teams/:id/removeCompanion should return 200', function (done) {
        request
            .put('/teams/' + this.idTeam + '/removeCompanion')
            .send({
                companion: this.companionToAdd._id
            })
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.companions.length === 2);
                done();
            });
    });

    it('PUT /teams/:id/addTask should return 400', function (done) {
        request
            .put('/teams/' + this.idTeam + '/addTask')
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'missing params');
                done();
            });
    });

    it('PUT /teams/:id/addTask should return 400', function (done) {
        request
            .put('/teams/' + 123 + '/addTask')
            .send({
                task: '123'
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'team does not exist');
                done();
            });
    });

    it('PUT /teams/:id/addTask should return 400', function (done) {
        request
            .put('/teams/' + this.idTeam + '/addTask')
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

    it('PUT /teams/:id/addTask should return 200', function (done) {
        request
            .put('/teams/' + this.idTeam + '/addTask')
            .send({
                task: this.task._id
            })
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.tasks[0] == this.task._id &&
                    res.body.companions[0].tasksInProgress[0] == this.task._id);
                done();
            }.bind(this));
    });

    it('PUT /teams/:id/addTask should return 400', function (done) {
        request
            .put('/teams/' + this.idTeam + '/addTask')
            .send({
                task: this.task._id
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'task already in the team');
                done();
            });
    });

    it('PUT /teams/:id/removeTask should return 400', function (done) {
        request
            .put('/teams/' + 123 + '/removeTask')
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'missing params');
                done();
            });
    });

    it('PUT /teams/:id/removeTask should return 400', function (done) {
        request
            .put('/teams/' + 123 + '/removeTask')
            .send({
                task: '123'
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'team does not exist');
                done();
            });
    });

    it('PUT /teams/:id/removeTask should return 400', function (done) {
        request
            .put('/teams/' + this.idTeam + '/removeTask')
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

    it('PUT /teams/:id/removeTask should return 400', function (done) {
        request
            .put('/teams/' + this.idTeam + '/removeTask')
            .send({
                task: this.task2
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'task is not in the team');
                done();
            });
    });

    it('PUT /teams/:id/removeTask should return 200', function (done) {
        request
            .put('/teams/' + this.idTeam + '/removeTask')
            .send({
                task: this.task._id
            })
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.tasks.length === 0 &&
                    res.body.companions[0].tasksInProgress.length === 0);
                done();
            });
    });

    it('PUT /teams/:id should return 200', function (done) {
        request
            .put('/teams/' + this.idTeam)
            .send({
                name: 'nameUpdate'
            })
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(res.body.name === 'nameUpdate');
                done();
            });
    });

    it('PUT /teams/:id should return 400', function (done) {
        request
            .put('/teams/' + 123)
            .expect('Content-Length', 19)
            .expect(400, done);
    });

    /*it('DELETE /teams/:id should return 401', function (done) {
        request
            .del('/teams/' + this.idTeam)
            .expect(401, done);
    });*/

    /*it('DELETE /teams/:id should return 200', function (done) {
        var encoded = new Buffer('chief:chief').toString('base64');
        request
            .post('/login')
            .set('Authorization', 'basic ' + encoded)
            .end(function (err, res) {
                assert(err === null);
                var token = res.body.token;
                request
                    .del('/teams/' + this.idTeam)
                    .set('Authorization', 'Bearer ' + token)
                    .expect(200)
                    .end(function (err) {
                        assert(err == null);
                        done()
                    });
            }.bind(this));
    });*/

    after(function (done) {
        mongoose.connection.db.dropCollection('companions', function (err) {
            if (err) done(err);
            mongoose.connection.db.dropCollection('teams', function (err) {
                if (err) done(err);
                done();
            });
        })
    });
});