/**
 * Created by nana on 07/02/2016.
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
        name: 'companion'
    }
];

var dataTask = [
    {
        designation: 'task1'
    }
];

describe('History', function () {
    before(function (done) {
        db.Companion.create(dataCompanion, function (err, companions) {
            var self = this;
            self.idCompanion = companions[0]._id;
            if (err) return done(err);
            db.Task.create(dataTask, function (err, tasks) {
                self.idTask = tasks[0]._id;
                if (err) return done(err);
                done();
                /*var dataHistory = [{
                    companion: companions[0]._id,
                    taskInProgress: tasks[0]._id,
                    date: '2016:02:07'
                }];
                db.History.create(dataHistory, function (err) {
                    if (err) return done(err);
                    done();
                })*/
            });
        }.bind(this));
    });

    it('POST /history should return 400', function (done) {
        request
            .post('/history')
            .expect('Content-Length', 14)
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'missing params');
                done();
            });
    });

    it('POST /history should return 400', function (done) {
        request
            .post('/history')
            .send({
                companion: '123',
                taskInProgress: [{id:'123', duration: 123}],
                date: '2016:02:07'
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'user does not exist');
                done();
            });
    });

    it('POST /history should return 400', function (done) {
        request
            .post('/history')
            .send({
                companion: this.idCompanion,
                taskInProgress: [{id: '123', duration: 123}],
                date: '2016:02:07'
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'task does not exist');
                done();
            });
    });

    it('POST /history should return 400', function (done) {
        request
            .post('/history')
            .send({
                companion: this.idCompanion,
                taskInProgress: [{id: this.idTask}],
                date: '20160207'
            })
            .expect(400)
            .end(function (err, res) {
                assert(err === null);
                assert(res.text === 'date wrong format');
                done()
            });
    });

    it('POST /history should return 200', function (done) {
        request
            .post('/history')
            .send({
                companion: this.idCompanion,
                taskInProgress: [{id: this.idTask, duration: 123}, {id: this.idTask, duration: 123}],
                date: '2016:02:07'
            })
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(JSON.stringify(res.body[0].companion) == JSON.stringify(this.idCompanion));
                done();
            }.bind(this));
    });

    it('POST /history should return 200', function (done) {
        request
            .post('/history')
            .send({
                companion: this.idCompanion,
                taskInProgress: [{id: this.idTask, duration: 123}],
                date: '2016:02:07'
            })
            .expect(200)
            .end(function (err, res) {
                assert(err === null);
                assert(JSON.stringify(res.body[0].companion) == JSON.stringify(this.idCompanion));
                done();
            }.bind(this));
    });

    after(function (done) {
        mongoose.connection.db.dropCollection('tasks', function (err) {
            if (err) return done(err);
            mongoose.connection.db.dropCollection('histories', function (err) {
                if (err) return done(err);
                mongoose.connection.db.dropCollection('companions', function (err) {
                    if (err) return done(err);
                    done();
                });
            });
        });
    });
});