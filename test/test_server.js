var restify = require('restify');
var should = require('should');

before(function(done) {
  require('../server.js');
  done();
});

var client = restify.createJsonClient({
  version: '*',
  url: 'http://localhost:8080'
});

describe('basic functionality', function() {
  it('should send a 200 OK response', function(done) {
    client.get('/hook/project_one?key=p1_key', function(err, req, res, data) {
      should.not.exist(err);
      res.statusCode.should.eql(200);
      done();
    });
  });
});
