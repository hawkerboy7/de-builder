(function() {
  var BrowserSync, browserSync, fs, http, log, mkdirp, path, version,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  http = require('http');

  path = require('path');

  log = require('de-logger');

  mkdirp = require('mkdirp');

  browserSync = require('browser-sync');

  version = require('browser-sync/package.json').version;

  BrowserSync = (function() {
    function BrowserSync(server) {
      this.server = server;
      this.bundle = bind(this.bundle, this);
      this.reload = bind(this.reload, this);
      this.initialized = bind(this.initialized, this);
      if (!this.server.config.browserSync.enabled || this.server.config.type === 2) {
        return;
      }
      this.load();
      this.listeners();
    }

    BrowserSync.prototype.load = function() {
      var config;
      this.config = this.server.config.browserSync;
      this.filePath = this.server.myRoot + path.sep + 'build' + path.sep + 'browser-sync.js';
      this.bs = browserSync.create();
      config = {
        ui: {
          port: this.config.ui
        },
        port: this.config.server,
        logLevel: 'silent',
        logFileChanges: false
      };
      return this.bs.init(config, (function(_this) {
        return function(err) {
          if (err) {
            return log.error(_this.server.config.title + " - Browser-sync", "Couldn't start \n\n", err);
          }
          return _this.code();
        };
      })(this));
    };

    BrowserSync.prototype.listeners = function() {
      this.server.vent.on('browserify:initialized', this.initialized);
      this.server.vent.on('browserify:bundle', this.bundle);
      return this.server.vent.on('compiled:file', this.reload);
    };

    BrowserSync.prototype.initialized = function(w) {
      var added, bundle, folder, i, len, ref;
      this.init = true;
      if (w._browserSyncIndicator) {
        added = false;
        ref = this.config.multi;
        for (i = 0, len = ref.length; i < len; i++) {
          folder = ref[i];
          if (!(bundle = w[folder])) {
            continue;
          }
          added = true;
          bundle.require('socket.io-client', {
            expose: 'socket.io-client'
          });
          bundle.add(path.resolve(__dirname, '../socketIO/socket.io-client'));
          bundle.add(this.filePath);
        }
        if (!added) {
          return log.warn(this.server.config.title + " - Browser-sync", "browser-sync was not added");
        }
      } else {
        w.require('socket.io-client', {
          expose: 'socket.io-client'
        });
        w.add(path.resolve(__dirname, '../socketIO/socket.io-client'));
        return w.add(this.filePath);
      }
    };

    BrowserSync.prototype.code = function() {
      log.info(this.server.config.title + " - Browser-sync", "Browser-sync server started");
      return this.download("http://localhost:" + this.config.server + "/browser-sync/browser-sync-client." + version + ".js", (function(_this) {
        return function(err) {
          if (err) {
            return log.error(_this.server.config.title + " - Browser-sync", "Unable to get browser-sync .js file", err);
          }
          return log.info(_this.server.config.title + " - Browser-sync", "UI ready at localhost:" + _this.config.ui);
        };
      })(this));
    };

    BrowserSync.prototype.download = function(url, cb) {
      return mkdirp(path.dirname(this.filePath), (function(_this) {
        return function() {
          _this.file = fs.createWriteStream(_this.filePath);
          return http.get(url, function(response) {
            return response.pipe(_this.file).on('error', function(err) {
              fs.unlink(_this.file);
              return cb(err);
            }).on('finish', function() {
              return _this.file.close(cb);
            });
          });
        };
      })(this));
    };

    BrowserSync.prototype.reload = function(arg) {
      var file;
      file = arg.file;
      if (!this.init) {
        return;
      }
      if ('.css' === path.extname(file)) {
        return this._reload(file);
      }
    };

    BrowserSync.prototype.bundle = function(file) {
      return this._reload(file);
    };

    BrowserSync.prototype._reload = function(file) {
      log.info(this.server.config.title + " - Browser-sync", "Reload", file.replace(this.server.root + "/", ''));
      return this.bs.reload(file);
    };

    return BrowserSync;

  })();

  module.exports = BrowserSync;

}).call(this);
