'use strict';

var request = require('supertest');
var should = require('should');
var app = require('../app').app;

describe('Route via waypoints', function () {

  describe('route between points in lat/lon', function() {
    it('should return 2 results', function (done) {
      request(app)
        .get('/viaroute?loc=-105.1092,40.1717&loc=-105.12,40.19')
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
