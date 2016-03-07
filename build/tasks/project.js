(function() {
  var Project, log, mkdirp, path,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  path = require('path');

  log = require('de-logger');

  mkdirp = require('mkdirp');

  Project = (function() {
    function Project(server) {
      this.server = server;
      this.handle = bind(this.handle, this);
      this.setup = bind(this.setup, this);
      this.listeners();
    }

    Project.prototype.listeners = function() {
      return this.server.vent.on('clean:done', this.setup);
    };

    Project.prototype.setup = function() {
      this.i = 0;
      if (this.server.config.type === 1) {
        return this.typeOne();
      }
      return this.typeTwo();
    };

    Project.prototype.typeOne = function() {
      mkdirp(this.server.folders.src.client, this.handle);
      mkdirp(this.server.folders.src.server, this.handle);
      mkdirp(this.server.folders.build.client, this.handle);
      return mkdirp(this.server.folders.build.server, this.handle);
    };

    Project.prototype.typeTwo = function() {
      mkdirp(this.server.folders.src.index, this.handle);
      return mkdirp(this.server.folders.build.index, this.handle);
    };

    Project.prototype.handle = function() {
      this.i++;
      if ((this.server.config.type === 1 && this.i === 4) || (this.server.config.type === 2 && this.i === 2)) {
        log.info('LDE - Project', this.explaination());
        return this.server.vent.emit('project:done');
      }
    };

    Project.prototype.explaination = function() {
      var message, type;
      type = this.server.config.type;
      message = 'Project type "';
      if (type === 1) {
        message += 'Server-Client';
      }
      if (type === 2) {
        message += 'Server';
      }
      if (type === 3) {
        message += 'Client (NodeWebkit)';
      }
      return message += '" is used';
    };

    return Project;

  })();

  module.exports = Project;

}).call(this);
