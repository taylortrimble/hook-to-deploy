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

describe('key correctness:', function() {
  it('should send a 200 OK response for correct keys', function(done) {
    client.get('/hook/project_one?key=p1_key', function(err, req, res, data) {
      should.not.exist(err);
      res.statusCode.should.eql(200);
      done();
    });
  });
  it('should send a 403 Forbidden server error for incorrect keys', function(done) {
    client.get('/hook/project_one?key=BAD_KEY', function(err, req, res, data) {
      should.exist(err);
      res.statusCode.should.eql(403);
      data.error.code.should.eql('INCORRECT_KEY');
      done();
    });
  });
});
