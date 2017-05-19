var Forever, Monitor, log, path,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

path = require('path');

log = require('de-logger');

Monitor = require('forever-monitor').Monitor;

Forever = (function() {
  function Forever(server) {
    this.server = server;
    this.terminate = bind(this.terminate, this);
    this.forever = bind(this.forever, this);
    this.initialized = bind(this.initialized, this);
    if (this.server.config.forever.enabled && this.server.config.type !== 3) {
      this.listeners();
    }
  }

  Forever.prototype.listeners = function() {
    this.server.vent.on('terminate:child', this.terminate);
    this.server.vent.on('compiled:file', this.forever);
    return this.server.vent.on('watch:initialized', this.initialized);
  };

  Forever.prototype.initialized = function() {
    this.init = true;
    return this.forever();
  };

  Forever.prototype.forever = function(args) {
    var build, file;
    if (!this.init) {
      return;
    }
    file = args != null ? args.file : void 0;
    if (!file) {
      return this.start();
    }
    build = this.server.folders.build.server;
    if (this.server.config.type === 2) {
      build = this.server.folders.build.index;
    }
    if (path.extname(file) === '.jade' || -1 === file.indexOf(build)) {
      return;
    }
    return this.start();
  };

  Forever.prototype.start = function() {
    var entry, src;
    src = this.server.folders.build.server;
    if (this.server.config.type === 2) {
      src = this.server.folders.build.index;
    }
    entry = src + path.sep + this.server.config.forever.entry;
    this.terminate();
    this.child = new Monitor(entry, {
      max: 1,
      killTree: true
    });
    this.child.on('exit:code', (function(_this) {
      return function(code) {
        if (code) {
          return log.warn(_this.server.config.title + " - Forever stopped with code: " + code);
        }
      };
    })(this));
    return this.child.start();
  };

  Forever.prototype.terminate = function() {
    if (this.child && this.child.running) {
      return this.child.kill();
    }
  };

  return Forever;

})();

module.exports = Forever;
