'use strict';

var express = require('express');
var http = require('http');
var serveSpa = require('../../lib/index.js');
var path = require('path');
var rp = require('request-promise');


describe('Regarding the beforeAll hook, Serve-SPA', function () {

    var server;

    before(function (done) {
        var app = express();
        serveSpa(app, path.join(__dirname, '../fixtures/serve/'), {

            beforeAll: function (req, res, next) {

                switch (req.path) {
                    case '/beforeAll-hook/own':
                        res.send('own');
                        return;
                    case '/beforeAll-hook/redirect':
                        res.redirect('http://localhost:4000/sub1/');
                        return;
                }

                req.param1 = 'original param1';
                req.param2 = 'original param2';
                next();

            }

        });
        server = http.createServer(app);
        server.listen(4000, function () { done(); });
    });

    after(function () {
        server.close();
    });


    it('should call the beforeAll middleware first', function () {

        return rp('http://localhost:4000/beforeAll-hook')
            .then(function (body) {
                expect(body).to.equal('original param1, overwritten');
            });

    });

    it('should allow serving its own response', function () {

        return rp('http://localhost:4000/beforeAll-hook/own')
            .then(function (body) {
                expect(body).to.equal('own');
            });

    });

    it('should allow a redirect', function () {

        return rp('http://localhost:4000/beforeAll-hook/redirect')
            .then(function (body) {
                expect(body).to.equal('sub1');
            });

    });

});
