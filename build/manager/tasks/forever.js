(function() {
  var Forever, forever, fs, log;

  fs = require('fs');

  log = require('de-logger');

  forever = require('forever-monitor');

  Forever = (function() {
    function Forever(server) {
      this.server = server;
      if (!this.server.options.forever.enabled) {
        return;
      }
      this.path = this.server.options.root + "/" + this.server.options.build + "/" + this.server.options.server + "/" + this.server.options.forever.file;
      this.create();
    }

    Forever.prototype.create = function() {
      this.child = new forever.Monitor(this.path, {
        max: 1,
        watch: false,
        killTree: true
      });
      return this.child.on('exit:code', (function(_this) {
        return function(code) {
          if (code === null) {
            return;
          }
          return log.warn('LDE - Forever', "Exit code: " + code + ". " + _this.server.options.build + "/" + _this.server.options.server + "/" + _this.server.options.forever.file);
        };
      })(this));
    };

    Forever.prototype.start = function() {
      if (!this.server.options.forever.enabled) {
        return;
      }
      return fs.exists(this.path, (function(_this) {
        return function(bool) {
          if (!bool) {
            return log.warn('LDE - Forever', 'Entry file doesn\'t exist', _this.path.replace(_this.server.options.root + "/", ''));
          }
          if (_this.child.running) {
            return _this.child.restart();
          }
          return _this.child.start();
        };
      })(this));
    };

    return Forever;

  })();

  module.exports = Forever;

}).call(this);
