var config = require('./config.js');

var restify = require('restify');
var util = require('util');

var server = restify.createServer();
server.use(restify.queryParser()); // Allows us to access req.query
server.name = 'Hook to Deploy';

server.get('/hook/:hook_name', function(req, res, next) {
  var hook = config.hooks[req.params.hook_name];
  if (!(req.query.hasOwnProperty('key'))) {
    var no_key_error = util.format('Missing key for hook \'%s\'. ' +
                                   'Pass in the key as a query string (?key=YOUR_KEY_HERE).',
                                   req.params.hook_name);
    res.send(400, {error: {code: 'MISSING_KEY', message: no_key_error}});
  } else if (req.query.key !== hook.key) {
    var bad_key_error = util.format('Key for hook \'%s\' is incorrect.', req.params.hook_name);
    res.send(403, {error: {code: 'INCORRECT_KEY', message: bad_key_error}});
  } else {
    hook.action(req, res); // Hook must handle res.send()
  }
});

server.listen(config.port, function() {
  console.log('%s listening on %s', server.name, server.url);
});
