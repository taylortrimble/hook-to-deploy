// Don't edit this file: it's used for testing.

var util = require('util');
var tasks = require('./tasks.js');

var PORT = 8080;
var RESULTS_FOLDER = 'results';

var hooks = {
  // A very basic hook that verifies Hook to Deploy is working.
  // GET http://server:port/hook/basicHook?key=basicHookKey
  basicHook: {
    key: 'basicHookKey',
    action: function(req, res) {
      res.send({success: 'hello, this is ' + req.params.hookName});
    }
  },
  // Pass arguments to a hook.
  // GET http://server:port/hook/deepFryer?key=fryIt&toFry=fresh%20walleye
  deepFryer: {
    key: 'fryIt',
    action: function(req, res) {
      if ('toFry' in req.query) {
        var item = req.query.toFry;
        var text = util.format('I\'m going to fry %s for you now!', item);
        res.send({success: text});
      } else {
        res.send(400, {error: 'You didn\'t give me anything to fry'});
      }
    }
  },
  // Spawn a subprocess that may take a while. Return a reference so the user
  // can check if the process has finished and view its output.
  // GET http://server:port/hook/execPython?key=rngStart
  execPython: {
    key: 'rngStart',
    action: function(req, res) {
      var cmd = 'python -c "from random import randrange; from time import sleep; sleep(20); print(randrange(100))"';
      tasks.execSaveResults(cmd, RESULTS_FOLDER, function(err, procData) {
        if (err)
          res.send(500, {error: err});
        else
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
