'use strict';

var request = require('supertest');
var should = require('should');
var app = require('../app').app;

describe('Nearest point on a street segment', function () {
  describe('nearest point on a street segment', function() {
    it('should return 1 results', function (done) {
      request(app)
        .get('/nearest?loc=40.1717,-105.1092')
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          var result = JSON.parse(res.text);
          result.status.should.equal(0);
          done();
        });
    });
  });

});
