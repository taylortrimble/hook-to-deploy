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
  }
};

module.exports = {
  hooks: hooks
};
