(function() {
  var Validate, log;

  log = require('de-logger');

  Validate = function(options) {
    var valid;
    valid = true;
    options.src;
    options.build;
    options.type;
    options.client;
    options.server;
    if (valid) {
      return options;
    }
  };

  module.exports = Validate;

}).call(this);
