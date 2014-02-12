var should = require('should');
var random = require('../random.js');

describe('generateUUID', function() {
  it('should generate 32 characters', function() {
    random.generateUUID().should.have.a.lengthOf(32);
  });
  it('should generate hex characters only', function() {
    var uuid = random.generateUUID();
    for (var i = 0; i < uuid.length; i++) {
      /^[a-f0-9]+$/i.test(uuid[i]).should.be.ok;  // jshint ignore:line
    }
  });
});
