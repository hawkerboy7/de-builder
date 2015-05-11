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
      killTree: true,
      spinSleepTime: 1000
    });
    return this.child.on('exit:code', (function(_this) {
      return function(code) {
        return log.warn('LDE - Forever', "Exit code: " + code + ". " + _this.server.options.build + "/" + _this.server.options.server + "/" + _this.server.options.forever.file);
      };
    })(this));
  };

  Forever.prototype.start = function() {
    if (!this.server.options.forever.enabled) {
      return;
    }
    if (this.started === true) {
      this.stop();
    }
    return fs.exists(this.path, (function(_this) {
      return function(bool) {
        if (!bool) {
          return log.warn('LDE - Forever', 'Entry file doesn\'t exist', _this.path.replace(_this.server.options.root + "/", ''));
        }
        _this.started = true;
        return _this.child.start();
      };
    })(this));
  };

  Forever.prototype.stop = function() {
    if (!this.server.options.forever.enabled) {
      return;
    }
    this.child.stop();
    this.create();
    return this.started = false;
  };

  return Forever;

})();

module.exports = Forever;
