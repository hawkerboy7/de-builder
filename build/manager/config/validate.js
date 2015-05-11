(function() {
  var Validate, log, merge;

  log = require('de-logger');

  merge = require('../../helper/merge');

  Validate = function(config, options) {
    if (!options) {
      log.debug('LDE - Validate', 'No options provided');
      return config;
    }
    if (typeof options !== 'object' || Object.prototype.toString.call(options) !== '[object Object]') {
      log.warn('LDE - Validate', 'The provided options should be in an object');
      return config;
    }
    merge(config, options);
    return config;
  };

  module.exports = Validate;

}).call(this);
