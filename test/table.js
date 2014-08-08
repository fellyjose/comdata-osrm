'use strict';

var request = require('supertest');
var should = require('should');
var app = require('../app').app;

describe('distance tables', function () {

  describe('distance between points in lon/lat', function() {
    it('should return 2 results', function (done) {
      request(app)
        .get('/table?loc=40.1717,-105.1092&loc=40.19,-105.12')
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          var tbl = JSON.parse(res.text);
          tbl.length.should.equal(2);
          tbl[0][0].should.equal(0);
          tbl[1][1].should.equal(0);
          done();
        });
    });
  });

});
