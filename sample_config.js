// Copy this file to config.js before running Hook to Deploy.
// Leave this config file alone: it's used to run tests.

var util = require('util');

var PORT = 8080;

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
      var to_exec = 'python -c "from random import randrange; print(randrange(100))"';
      require('child_process').exec(to_exec, function(error, stdout, stderr) {
        var retval = {};
        retval.stdout = stdout.split('\n');
        retval.stderr = stderr.split('\n');
        if (error === null) {
          retval.success = true;
          res.send(200, retval);
        } else {
          retval.error = error;
          res.send(500, retval);
        }
      });
    }
  }
};

module.exports = {
  port: PORT,
  hooks: hooks
};
