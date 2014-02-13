// Don't edit this file: it's used for testing.

var util = require('util');
var tasks = require('./tasks.js');

var PORT = 8080;
var RESULTS_FOLDER = 'results';

var hooks = {
  // Your hooks go here.
  // Check out testing_config.js for hook suggestions.
  // Don't edit testing_config.js; it's used for running tests!
};

module.exports = {
  port: PORT,
  resultsFolder: RESULTS_FOLDER,
  hooks: hooks
};
