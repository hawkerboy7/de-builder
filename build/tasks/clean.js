var Clean, fs, log, mkdirp, rmdir,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

fs = require("fs");

log = require("de-logger");

rmdir = require("rmdir");

mkdirp = require("mkdirp");

Clean = (function() {
  function Clean(server) {
    this.server = server;
    this.start = bind(this.start, this);
    this.listeners();
  }

  Clean.prototype.listeners = function() {
    return this.server.vent.on("builder:start", this.start);
  };

  Clean.prototype.start = function() {
    return rmdir(this.server.folders.build.index, (function(_this) {
      return function() {
        return mkdirp(_this.server.folders.build.index).then(function() {
          log.info("LDE - Clean", _this.server.symbols.finished);
          return _this.server.vent.emit("clean:done");
        });
      };
    })(this));
  };

  return Clean;

})();

module.exports = Clean;
