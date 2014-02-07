if (process.env.NODE_ENV === 'test')
  var configPath = './sample_config.js';
else
  var configPath = './config.js';

var config = require(configPath);
var strings = require('./strings.js');

var restify = require('restify');

var FORBIDDEN_CODE = 403;
var FORBIDDEN_ERROR = {error: {code: 'FORBIDDEN',
                               message: strings.FORBIDDEN}};
function FORBIDDEN_CALLBACK(req, res, next) {
  res.send(FORBIDDEN_CODE, FORBIDDEN_ERROR);
}

var server = restify.createServer();
server.use(restify.queryParser()); // Allows us to access req.query
server.name = 'Hook to Deploy';

server.get('/hook/:hookName', function(req, res, next) {
  if (!(req.params.hasOwnProperty('hookName')) ||            // no hook name provided or
      !(config.hooks.hasOwnProperty(req.params.hookName))) { // hook does not exist
    res.send(FORBIDDEN_CODE, FORBIDDEN_ERROR);
  }

  var hook = config.hooks[req.params.hookName];
  if (!(req.query.hasOwnProperty('key')) ||                   // no key provided or
      req.query.key !== hook.key) {                           // hook key is incorrect
    res.send(FORBIDDEN_CODE, FORBIDDEN_ERROR);
  } else {
    hook.action(req, res); // Hook must handle res.send()
  }
});
server.on('NotFound', FORBIDDEN_CALLBACK);
server.on('MethodNotAllowed', FORBIDDEN_CALLBACK);

server.listen(config.port, function() {
  console.log('%s listening on %s', server.name, server.url);
});
