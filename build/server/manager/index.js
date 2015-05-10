var Manager, Project, Tasks, Validate, config, log, path;

log = require('de-logger');

path = require('path');

config = require('./config');

Tasks = require('./tasks');

Project = require('../extra/project');

Validate = require('./config/validate');

Manager = (function() {
  function Manager(options, start) {
    log.set({
      debug: {
        display: false
      }
    });
    if (!start) {
      log.clear();
    }
    log.info('LDE', 'Live Development Environment started');
    this.options = Validate(config, options);
    this.options.root = path.resolve('./');
    if (start) {
      return new Project(this.options);
    }
    this.load();
  }

  Manager.prototype.load = function() {
    return this.tasks = new Tasks(this.options);
  };

  return Manager;

})();

module.exports = Manager;
