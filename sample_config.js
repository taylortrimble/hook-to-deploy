// Copy this file to config.js before running Hook to Deploy.
// Leave this config file alone: it's used to run tests.

var util = require('util');

var port = 8080;

var hooks = {
  project_one: { // http://server:port/hook/project_one?key=p1_key
    key: 'p1_key',
    action: function(req, res) {
      res.send({'success': 'hello, this is ' + req.params.hook_name});
    }
  },
  project_two: { // http://server:port/hook/project_two?key=fry_it&to_fry=fresh%20walleye
    key: 'fry_it',
    action: function(req, res) {
      if ('to_fry' in req.query) {
        var item = req.query.to_fry;
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
  port: port,
  hooks: hooks
};
