var Forever, forever, fs, log;

fs = require('fs');

log = require('de-logger');

forever = require('forever-monitor');

Forever = (function() {
  function Forever(server) {
    this.server = server;
    this.path = this.server.options.root + "/" + this.server.options.build + "/" + this.server.options.server + "/" + this.server.options.app;
    this.child = new forever.Monitor(this.path, {
      max: 1,
      watch: false,
      killTree: true,
      spinSleepTime: 1000
    });
    this.child.on('exit:code', (function(_this) {
      return function(code) {
        return log.warn('LDE - Forever', "Exit code: " + code + ". " + _this.server.options.build + "/" + _this.server.options.server + "/" + _this.server.options.app);
      };
    })(this));
  }

  Forever.prototype.start = function() {
    return fs.exists(this.path, (function(_this) {
      return function(bool) {
        if (!bool) {
          return log.warn('LDE - Forever', 'Entry file doesn\'t exist', _this.path.replace(_this.server.options.root + "/", ''));
        }
        return _this.child.start();
      };
    })(this));
  };

  Forever.prototype.stop = function() {
    return this.child.stop();
  };

  return Forever;

})();

module.exports = Forever;
