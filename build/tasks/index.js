(function() {
  var Browserify, Clean, Coffee, Copy, Forever, Less, Logger, Project, Tasks, Watch, path;

  path = require('path');

  Copy = require('./copy');

  Less = require('./less');

  Clean = require('./clean');

  Watch = require('./watch');

  Coffee = require('./coffee');

  Logger = require('./logger');

  Forever = require('./forever');

  Project = require('./project');

  Browserify = require('./browserify');

  Tasks = (function() {
    function Tasks(server) {
      this.server = server;
      this.load();
    }

    Tasks.prototype.load = function() {
      this.folders();
      new Copy(this.server);
      new Less(this.server);
      new Clean(this.server);
      new Watch(this.server);
      new Coffee(this.server);
      new Logger(this.server);
      new Forever(this.server);
      new Project(this.server);
      new Browserify(this.server);
      return this.server.vent.emit('builder:start');
    };

    Tasks.prototype.folders = function() {
      var build, src;
      return this.server.folders = {
        src: {
          index: src = "" + this.server.root + path.sep + this.server.config.src,
          server: "" + src + path.sep + this.server.config.server,
          client: "" + src + path.sep + this.server.config.client
        },
        build: {
          index: build = "" + this.server.root + path.sep + this.server.config.build,
          server: "" + build + path.sep + this.server.config.server,
          client: "" + build + path.sep + this.server.config.client
        }
      };
    };

    return Tasks;

  })();

  module.exports = Tasks;

}).call(this);
