(function() {
  var Watch, chokidar, fs, log, path,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  path = require('path');

  log = require('de-logger');

  chokidar = require('chokidar');

  Watch = (function() {
    function Watch(server) {
      this.server = server;
      this.increase = bind(this.increase, this);
      this.ready = bind(this.ready, this);
      this.unlink = bind(this.unlink, this);
      this.change = bind(this.change, this);
      this.add = bind(this.add, this);
      this.watchSrc = bind(this.watchSrc, this);
      this.listeners();
    }

    Watch.prototype.listeners = function() {
      this.server.vent.on('project:done', this.watchSrc);
      return this.server.vent.on('watch:increase', this.increase);
    };

    Watch.prototype.watchSrc = function() {
      this.init = false;
      this.count = {
        first: 0,
        second: 0
      };
      log.info(this.server.config.title + " - Watch", '~ Night gathers, and now my watch begins ~');
      return chokidar.watch(this.server.config.src, {
        ignored: /[\/\\]\./
      }).on('add', this.add).on('change', this.change).on('unlink', this.unlink).on('ready', this.ready);
    };

    Watch.prototype.add = function(file) {
      if (!this.init) {
        this.count.first++;
      }
      return this.addChange('Add', file);
    };

    Watch.prototype.change = function(file) {
      return this.addChange('Change', file);
    };

    Watch.prototype.addChange = function(type, file) {
      var extention;
      log.debug(this.server.config.title + " - Watch", type + ": " + file);
      extention = path.extname(file);
      if (extention === '.less') {
        return this.server.vent.emit('less:file', file, this.init);
      }
      if (extention === '.coffee') {
        return this.server.vent.emit('coffee:file', file, this.init);
      }
      return this.server.vent.emit('copy:file', file, this.init);
    };

    Watch.prototype.unlink = function(file) {
      var remove, seperated;
      seperated = file.split(path.sep);
      seperated.shift();
      remove = this.server.config.build + path.sep + seperated.join(path.sep);
      log.info(this.server.config.title + " - Watch", "Unlink: " + remove);
      return fs.unlink(this.server.root + path.sep + remove, (function(_this) {
        return function(e) {};
      })(this));
    };

    Watch.prototype.ready = function() {
      this.init = true;
      log.debug(this.server.config.title + " - Watch", "Ready: " + this.count.first + " files initially added");
      return this.server.vent.emit('watch:init');
    };

    Watch.prototype.increase = function(count) {
      if (count) {
        this.count.second += count;
      } else {
        this.count.second++;
      }
      if (!(this.init && this.count.second === this.count.first)) {
        return;
      }
      this.initialized = true;
      log.debug(this.server.config.title + " - Watch", "Ready: " + this.count.second + " files have initially been created");
      return this.server.vent.emit('watch:initialized');
    };

    return Watch;

  })();

  module.exports = Watch;

}).call(this);
