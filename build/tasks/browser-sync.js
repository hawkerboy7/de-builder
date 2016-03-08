(function() {
  var BrowserSync, browserSync, fs, http, log, mkdirp, path, version;

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
      this.load();
    }

    BrowserSync.prototype.load = function() {
      this.filePath = this.server.myRoot + path.sep + 'build' + path.sep + 'browser-sync.js';
      this.bs = browserSync.create();
      this.config = {
        ui: {
          port: this.server.config.browserSync.ui
        },
        port: this.server.config.browserSync.server,
        logLevel: 'silent',
        logFileChanges: false
      };
      return this.bs.init(this.config, (function(_this) {
        return function(err) {
          if (err) {
            return log.error('LDE - BrowserSync', 'Couldn\'t start BrowserSync \n\n', err);
          }
          return _this.code();
        };
      })(this));
    };

    BrowserSync.prototype.reload = function(path) {
      log.info('LDE - BrowserSync', "Reload", path.replace(this.server.options.root + "/", ''));
      return this.bs.reload(path);
    };

    BrowserSync.prototype.code = function() {
      log.info('LDE - BrowserSync', "BrowserSync server started");
      return this.download("http://localhost:" + this.config.port + "/browser-sync/browser-sync-client." + version + ".js", (function(_this) {
        return function(err) {
          if (err) {
            return log.error('LDE - BrowserSync', "Unable to get browser-sync .js file", err);
          }
          log.info('LDE - BrowserSync', "Ready at localhost:" + _this.config.ui.port);
          if (_this.server.options.browserSync.enabled) {
            _this.server.browserify.w.require('socket.io-client', {
              expose: 'socket.io-client'
            });
            _this.server.browserify.w.add(path.resolve(__dirname, '../../helper/socket.io-client'));
            _this.server.browserify.w.add(_this.filePath);
          }
          _this.ready = true;
          return _this.server.watch.browserify();
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

    return BrowserSync;

  })();

  module.exports = BrowserSync;

}).call(this);
