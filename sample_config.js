// Copy this file to config.js before running Hook to Deploy.
// Leave this config file alone: it's used to run tests.

var util = require('util');
var tasks = require('./tasks.js');

var PORT = 8080;
var RESULTS_FOLDER = 'results';

var hooks = {
  projectOne: { // http://server:port/hook/projectOne?key=projOneKey
    key: 'projOneKey',
    action: function(req, res) {
      res.send({'success': 'hello, this is ' + req.params.hookName});
    }
  },
  projectTwo: { // http://server:port/hook/projectTwo?key=fryIt&toFry=fresh%20walleye
    key: 'fryIt',
    action: function(req, res) {
      if ('toFry' in req.query) {
        var item = req.query.toFry;
        var text = util.format('I\'m going to fry %s for you now!', item);
        res.send({'success': text});
      } else {
        res.send(400, {'error': 'You didn\'t give me anything to fry'});
      }
    }
  },
  exec_python: { // http://server:port/hook/exec_python?key=rng_key
    key: 'rng_key',
    action: function(req, res) {
      var cmd = 'python -c "from random import randrange; from time import sleep; sleep(20); print(randrange(100))"';
      var resultsFolder = 
      tasks.execSaveResults(cmd, RESULTS_FOLDER, function(err, procData) {
        if (err) res.send(500, {'error': err});
        res.send(procData);
      });
    }
  }
};

module.exports = {
  port: PORT,
  resultsFolder: RESULTS_FOLDER,
  hooks: hooks
};
