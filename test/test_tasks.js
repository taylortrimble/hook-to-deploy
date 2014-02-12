var should = require('should');
var sinon = require('sinon');

var tasks = require('../tasks.js');

var fs = require('fs');

describe('execSaveResults', function() {
  it('should fire a callback with in-progress data', function(done) {
    var stubFsWriteFile = sinon.stub(fs, 'writeFile').callsArg(2);
    tasks.execSaveResults('someFunction', 'resultsFolder', function(err, data) {
      should.not.exist(err);
      data.should.have.keys('toExec', 'resultsFile', 'startedAt', 'inProgress');
      data.toExec.should.equal('someFunction');
      data.resultsFile.should.endWith('.json');
      Date.parse(data.startedAt).should.be.ok;  // jshint ignore:line
      data.inProgress.should.be.true;  // jshint ignore:line

      stubFsWriteFile.restore();
      done();
    });
  });
});
