var should = require('should');
var sinon = require('sinon');

var tasks = require('../tasks.js');

var fs = require('fs');

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
});
