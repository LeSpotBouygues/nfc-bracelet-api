/**
 * Created by nana on 06/12/2015.
 */

var request = require('supertest');
var mongoose = require('mongoose');

var db = require('../models/data_models');

var app = require('../app.js');
require('../index');
var server = app.listen();
request = request.agent(server);

var dataLogin = [
    {
        name: 'admin',
        username: 'admin',
        password: 'admin',
        idBracelet: '1234'
    }
];

describe('Login WebApp', function () {
    before(function (done) {
        db.Companion.create(dataLogin, function (err, companions) {
            if (err) return done(err);
            var dataTeam = [{
                chief: companions[0]._id
            }];
            db.Team.create(dataTeam, function (err) {
                if (err) return done(err);
                done();
            });
        })
    });

    it('POST /login should 200', function (done) {
        request
            .post('/login')
            .set('Authorization', 'basic ' + 'YWRtaW46YWRtaW4=')
            .expect(200, done);
    });

    it('POST /login should 401', function (done) {
        request
            .post('/login')
            .expect(401)
            .expect('Content-Type', 'text/plain; charset=utf-8')
            .expect('Content-Length', 15)
            .end(done)
    });

    it('POST /login should 401', function (done) {
        request
            .post('/login')
            .set('Authorization', 'basic '+ 'YWRtaW46YWRtaQ==')
            .expect('Content-Type', 'text/plain; charset=utf-8')
            .expect('Content-Length', 14)
            .end(done)
    })
});

describe('Login Bracelet', function () {
    it('POST /loginWithBracelet should 200', function (done) {
        request
            .post('/loginWithBracelet')
            .set('Authorization', '1234')
            .expect(200, done);
    });

    it('POST /loginWithBracelet should 401', function (done) {
        request
            .post('/loginWithBracelet')
            .set('Authorization', '123')
            .expect('Content-Length', 14)
            .expect(401, done);
    });

    it('POST /loginWithBracelet 401', function (done) {
        request
            .post('/loginWithBracelet')
            .expect('Content-Length', 20)
            .expect(401, done);
    });

    after(function (done) {
        mongoose.connection.db.dropCollection('companions', function (err) {
            if (err) return done(err);
            mongoose.connection.db.dropCollection('teams', function (err) {
                if (err) return done(err);
                done();
            });
        })
    });
});