(function() {
  var Clean, Coffee, Copy, Forever, Less, Project, Tasks, Watch, path;

  path = require('path');

  Copy = require('./copy');

  Less = require('./less');

  Clean = require('./clean');

  Watch = require('./watch');

  Coffee = require('./coffee');

  Forever = require('./forever');

  Project = require('./project');

  Tasks = (function() {
    function Tasks(server) {
      this.server = server;
      this.load();
    }

    Tasks.prototype.load = function() {
      this.folders();
      this.copy = new Copy(this.server);
      this.less = new Less(this.server);
      this.clean = new Clean(this.server);
      this.watch = new Watch(this.server);
      this.coffee = new Coffee(this.server);
      this.forever = new Forever(this.server);
      this.project = new Project(this.server);
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
