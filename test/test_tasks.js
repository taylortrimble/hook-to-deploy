var should = require('should');
var sinon = require('sinon');

var tasks = require('../tasks.js');

var fs = require('fs');
var child_process = require('child_process');

var dataKeys = {
  inProgress: ['toExec', 'resultsFile', 'startedAt', 'inProgress'],
  success: ['toExec', 'resultsFile', 'startedAt', 'inProgress', 'finishedAt', 'stdout', 'stderr', 'success'],
  failure: ['toExec', 'resultsFile', 'startedAt', 'inProgress', 'finishedAt', 'stdout', 'stderr', 'error']
};

function validateInProgressData(data) {
  data.should.have.keys(dataKeys.inProgress);
  data.toExec.should.equal('someFunction');
  data.resultsFile.should.endWith('.json');
  Date.parse(data.startedAt).should.be.ok;  // jshint ignore:line
  data.inProgress.should.be.true;  // jshint ignore:line
}

function validateFinishedData(data, failureFlag) {
  if (failureFlag)
    data.should.have.keys(dataKeys.failure);
  else {
    data.should.have.keys(dataKeys.success);
    data.success.should.be.true;  //jshint ignore:line
  }
  data.toExec.should.equal('someFunction');
  data.resultsFile.should.endWith('.json');
  Date.parse(data.startedAt).should.be.ok;  // jshint ignore:line
  Date.parse(data.finishedAt).should.be.ok;  // jshint ignore:line
  data.stdout.should.eql(['Hello world', '']);
  data.stderr.should.eql(['OK', '']);
  data.inProgress.should.be.false;  // jshint ignore:line
}

describe('execSaveResults', function() {
  it('should fire a callback with in-progress data', function(done) {
    var stubFsWriteFile = sinon.stub(fs, 'writeFile').callsArg(2);
    tasks.execSaveResults('someFunction', 'resultsFolder', function(err, data) {
      should.not.exist(err);
      validateInProgressData(data);
    });
    var callChecker = setInterval(function() {
      if (stubFsWriteFile.callCount >= 2) {
        clearInterval(callChecker);
        stubFsWriteFile.restore();
        done();
      }
    }, 1);
  });
  it('should save its in-progress data into the results file before the process starts', function(done) {
    var stubFsWriteFile = sinon.stub(fs, 'writeFile').callsArg(2);
    tasks.execSaveResults('someFunction', 'resultsFolder', function(err) {
      should.not.exist(err);
    });
    var callChecker = setInterval(function() {
      if (stubFsWriteFile.callCount >= 2) {
        clearInterval(callChecker);
        
        var jsonData = stubFsWriteFile.getCall(0).args[1];
        var parsedData = JSON.parse(jsonData);
        validateInProgressData(parsedData);

        stubFsWriteFile.restore();
        done();
      }
    }, 1);
  });
  it('should save its final data into the results file after the process ends', function(done) {
    var stdout = 'Hello world\n';
    var stderr = 'OK\n';
    var stubFsWriteFile = sinon.stub(fs, 'writeFile').callsArg(2);
    var stubExec = sinon.stub(child_process, 'exec').callsArgWith(1, null, stdout, stderr);
    tasks.execSaveResults('someFunction', 'resultsFolder', function(err) {
      should.not.exist(err);
    });
    var callChecker = setInterval(function() {
      if (stubFsWriteFile.callCount >= 2) {
        clearInterval(callChecker);
        
        var jsonData = stubFsWriteFile.getCall(1).args[1];
        var parsedData = JSON.parse(jsonData);
        validateFinishedData(parsedData, false);

        stubFsWriteFile.restore();
        stubExec.restore();
        done();
      }
    }, 1);
  });
  it('should call the error callback on errors', function(done) {
    var testError = new Error('Test error');
    var stubFsWriteFile = sinon.stub(fs, 'writeFile').callsArgWith(2, testError);
    tasks.execSaveResults('someFunction', 'resultsFolder', function(err) {
      should.exist(err);
      err.should.equal(testError);
      stubFsWriteFile.restore();
      done();
    });
  });
});
