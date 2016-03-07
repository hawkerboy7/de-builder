(function() {
  var Clean, fs, log, rmdir,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  log = require('de-logger');

  rmdir = require('rmdir');

  Clean = (function() {
    function Clean(server) {
      this.server = server;
      this.handle = bind(this.handle, this);
      this.start = bind(this.start, this);
      this.listeners();
    }

    Clean.prototype.listeners = function() {
      return this.server.vent.on('builder:start', this.start);
    };

    Clean.prototype.start = function() {
      if ((this.type = this.server.config.type) === 1) {
        rmdir(this.server.folders.build.server, this.handle);
        rmdir(this.server.folders.build.client, this.handle);
      }
      if (this.type === 2 || this.type === 3) {
        return rmdir(this.server.folders.build.index, this.handle);
      }
    };

    Clean.prototype.handle = function() {
      if (this.type === 1 && !this.check) {
        return this.check = true;
      }
      log.info('LDE - Clean', this.server.symbols.finished);
      return this.server.vent.emit('clean:done');
    };

    return Clean;

  })();

  module.exports = Clean;

}).call(this);
