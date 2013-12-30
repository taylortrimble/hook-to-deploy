var util = require('util');

var hooks = {
  project_one: {
    key: 'p1_key',
    action: function(req, res) {
      res.send({'success': 'hello, this is ' + req.params.hook_name});
    }
  },
  project_two: {
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
  exec_python: {
    key: 'rng_key',
    action: function(req, res) {
      var range = req.query.range;
      var to_exec = 'python -c "from random import randrange; print(randrange(100))"';
      require('child_process').exec(to_exec, function(error, stdout, stderr) {
        var retval = {};
        retval.stdout = stdout;
        retval.stderr = stderr;
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
  hooks: hooks
};
