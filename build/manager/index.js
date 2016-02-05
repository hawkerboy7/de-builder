(function() {
  var Manager, Project, Tasks, Validate, config, log, path;

  log = require('de-logger');

  path = require('path');

  config = require('./config');

  Tasks = require('./tasks');

  Project = require('../extra/project');

  Validate = require('./config/validate');

  Manager = (function() {
    function Manager(options) {
      log.set({
        debug: {
          display: !!(options != null ? options.debug : void 0)
        }
      });
      this.options = Validate(config, options);
      this.options.root = path.resolve('./');
      log.clear();
      log.info('LDE', 'Live Development Environment started');
      new Project(this.options, function(e) {
        if (e) {
          log.warn('LDE', e);
        }
        return new Tasks(this.options);
      });
    }

    return Manager;

  })();

  module.exports = Manager;

}).call(this);
