var should = require('should');
var sinon = require('sinon');

var restify = require('restify');

var fs = require('fs');
var tasks = require('../tasks.js');

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
  it('should send a 403 Forbidden response for incorrect keys', function(done) {
    GET_FORBIDDEN('/hook/basicHook?key=BAD_KEY', done);
  });
  it('should send a 403 Forbidden response for missing keys', function(done) {
    GET_FORBIDDEN('/hook/basicHook', done);
  });
  it('should send a 403 Forbidden response for nonexistent hooks', function(done) {
    GET_FORBIDDEN('/hook/DOES_NOT_EXIST', done);
  });
  it('should send a 403 Forbidden response for nonexistent hooks with a key', function(done) {
    GET_FORBIDDEN('/hook/DOES_NOT_EXIST?key=BAD_KEY', done);
  });
  it('should send a 403 Forbidden response for nonexistent routes', function(done) {
    GET_FORBIDDEN('/DOES_NOT_EXIST', done);
  });
  it('should send a 403 Forbidden response for nonexistent routes with a key', function(done) {
    GET_FORBIDDEN('/DOES_NOT_EXIST?key=BAD_KEY', done);
  });
  it('should send a 403 Forbidden response for the root route', function(done) {
    GET_FORBIDDEN('/', done);
  });
  it('should send a 403 Forbidden response for the root route with a key', function(done) {
    GET_FORBIDDEN('/?key=BAD_KEY', done);
  });
  it('should send a 403 Forbidden response for using invalid methods on GET-only routes', function(done) {
    client.del('/hook/basicHook?key=basicHookKey', function(err, req, res) {
      should.exist(err);
      res.statusCode.should.equal(403);
      done();
    });
  });
});

describe('basic hook', function() {
  it('should send a 200 OK response when requested with the correct key', function(done) {
    client.get('/hook/basicHook?key=basicHookKey', function(err, req, res, data) {
      should.not.exist(err);
      res.statusCode.should.equal(200);
      data.success.should.equal('hello, this is basicHook');
      done();
    });
  });
});

describe('argument-handling hook', function() {
  it('should handle arguments passed via query params', function(done) {
    client.get('/hook/deepFryer?key=fryIt&toFry=the%20CPU', function(err, req, res, data) {
      should.not.exist(err);
      res.statusCode.should.equal(200);
      data.success.should.equal('I\'m going to fry the CPU for you now!');
      done();
    });
  });
  it('should throw a 400 BAD REQUEST error when query params are missing', function(done) {
    client.get('/hook/deepFryer?key=fryIt', function(err, req, res, data) {
      should.exist(err);
      res.statusCode.should.equal(400);
      data.error.should.equal('You didn\'t give me anything to fry');
      done();
    });
  });
});

describe('tasks.execSaveResults hook', function() {
  it('should send in-progress data after the task is started', function(done) {
    var sampleData = {'sample': 'data'};
    var stubExecTask = sinon.stub(tasks, 'execSaveResults').callsArgWith(2, null, sampleData);
    client.get('/hook/execPython?key=rngStart', function(err, req, res, data) {
      should.not.exist(err);
      res.statusCode.should.equal(200);
      data.should.eql(sampleData);
      stubExecTask.restore();
      done();
    });
  });
  it('should send a 500 error if an error is thrown', function(done) {
    var sampleError = new Error('Something broke, yo');
    var stubExecTask = sinon.stub(tasks, 'execSaveResults').callsArgWith(2, sampleError, null);
    client.get('/hook/execPython?key=rngStart', function(err, req, res, data) {
      should.exist(err);
      res.statusCode.should.equal(500);
      data.error.should.eql(sampleError);
      stubExecTask.restore();
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
  it('should send a 500 ERROR response if fs.readFile throws an error', function(done) {
    var sampleError = new Error('Something broke, yo');
    var isFileMethod = { isFile: function() { return true; } };
    var stubFsExistsSync = sinon.stub(fs, 'existsSync').returns(true);
    var stubFsStatSync = sinon.stub(fs, 'statSync').returns(isFileMethod);
    var stubFsReadFile = sinon.stub(fs, 'readFile').callsArgWith(2, sampleError, null);
    client.get('/results/cafefaceb00c.json', function(err, req, res, data) {
      should.exist(err);
      res.statusCode.should.equal(500);
      data.error.should.eql(sampleError);

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
