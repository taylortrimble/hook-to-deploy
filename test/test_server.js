var should = require('should');
var sinon = require('sinon');

var restify = require('restify');
var fs = require('fs');

before(function(done) {
  process.env.NODE_ENV = 'test';
  require('../server.js');
  done();
});

var client = restify.createJsonClient({
  version: '*',
  url: 'http://localhost:8080'
});

function GET_FORBIDDEN(path, done) {
  client.get(path, function(err, req, res, data) {
    should.exist(err);
    res.statusCode.should.equal(403);
    data.error.code.should.equal('FORBIDDEN');
    done();
  });
}

describe('Hook to Deploy', function() {
  it('should send a 200 OK response for correct keys', function(done) {
    client.get('/hook/basicHook?key=basicHookKey', function(err, req, res, data) {
      should.not.exist(err);
      res.statusCode.should.equal(200);
      data.success.should.equal('hello, this is basicHook');
      done();
    });
  });
  it('should send a 403 Forbidden response for incorrect keys', function(done) {
    GET_FORBIDDEN('/hook/basicHook?key=BAD_KEY', done);
  });
  it('should send a 403 Forbidden response for missing keys', function(done) {
    GET_FORBIDDEN('/hook/basicHook', done);
  });
  it('should send a 403 Forbidden response for nonexistent routes', function(done) {
    GET_FORBIDDEN('/DOES_NOT_EXIST', done);
  });
  it('should send a 403 Forbidden response for nonexistent routes with a key', function(done) {
    GET_FORBIDDEN('/', done);
  });
  it('should send a 403 Forbidden response for the root route', function(done) {
    GET_FORBIDDEN('/', done);
  });
  it('should send a 403 Forbidden response for the root route with a key', function(done) {
    GET_FORBIDDEN('/', done);
  });
});

describe('wrong methods:', function() {
  it('should send a 403 Forbidden response for using invalid methods on GET-only routes', function(done) {
    client.del('/hook/basicHook?key=basicHookKey', function(err, req, res) {
      should.exist(err);
      res.statusCode.should.equal(403);
      done();
    });
  });
});

describe('results route', function() {
  it('should send file contents for result files that exist', function(done) {
    var isFileMethod = { isFile: function() { return true; } };
    var fileData = {'dummyData': '0xDEADBEEFCAFE'};
    var jsonData = JSON.stringify(fileData);
    var stubFsExistsSync = sinon.stub(fs, 'existsSync').returns(true);
    var stubFsStatSync = sinon.stub(fs, 'statSync').returns(isFileMethod);
    var stubFsReadFile = sinon.stub(fs, 'readFile').callsArgWith(2, null, jsonData);
    client.get('/results/cafebabefacade.json', function(err, req, res, data) {
      should.not.exist(err);
      res.statusCode.should.equal(200);
      data.should.eql(fileData);

      stubFsExistsSync.restore();
      stubFsStatSync.restore();
      stubFsReadFile.restore();
      
      done();
    });
  });
  it('should send a 403 Forbidden response for result files that don\'t exist', function(done) {
    GET_FORBIDDEN('/results/DOES_NOT_EXIST.json', done);
  });
});
