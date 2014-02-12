var should = require('should');
var sinon = require('sinon');

var tasks = require('../tasks.js');

var fs = require('fs');

var procDataKeys = ['toExec', 'resultsFile', 'startedAt', 'inProgress'];

function validateInProgressData(data) {
  data.should.have.keys(procDataKeys);
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
      stubFsWriteFile.restore();
      done();
    });
  });
});
