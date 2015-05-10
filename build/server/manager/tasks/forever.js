var Forever, forever, log;

log = require('de-logger');

forever = require('forever-monitor');

Forever = (function() {
  function Forever(server) {
    var restarts;
    this.server = server;
    restarts = 3;
    this.path = this.server.options.root + "/" + this.server.options.build + "/" + this.server.options.server + "/" + this.server.options.app;
    this.child = new forever.Monitor(this.path, {
      max: restarts,
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
    return this.child.start();
  };

  Forever.prototype.stop = function() {
    return this.child.stop();
  };

  return Forever;

})();

module.exports = Forever;
