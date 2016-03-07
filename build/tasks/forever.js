(function() {
  var Forever, Monitor, log,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  log = require('de-logger');

  Monitor = require('forever-monitor').Monitor;

  Forever = (function() {
    function Forever(server) {
      this.server = server;
      this.forever = bind(this.forever, this);
      if (this.server.config.forever.enabled && this.server.config.type !== 3) {
        this.listeners();
      }
    }

    Forever.prototype.listeners = function() {
      return this.server.vent.on('forever:file', this.forever);
    };

    Forever.prototype.forever = function() {
      var file, src;
      src = this.server.folder.index;
      if (this.server.config.type === 2) {
        src = this.server.folder.server;
      }
      file = src + path.sep + this.server.config.forever.file;
      console.log("file: ", file);
      if (this.child) {
        this.child.exit();
      }
      this.child = new Monitor(file, {
        max: 1,
        killTree: true
      });
      this.child.on('exit:code', (function(_this) {
        return function(code) {
          console.log(arguments);
          return log.info(_this.server.config.title + " - Forever stopped with code:", code);
        };
      })(this));
      return this.child.start();
    };

    return Forever;

  })();

  module.exports = Forever;

}).call(this);
