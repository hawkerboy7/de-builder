var BrowserSync, browserSync, fs, http, log, mkdirp, path, version;

fs = require('fs');

log = require('de-logger');

http = require('http');

path = require('path');

mkdirp = require('mkdirp');

browserSync = require('browser-sync');

version = require('../../../../node_modules/browser-sync/package.json').version;

BrowserSync = (function() {
  function BrowserSync(server) {
    this.server = server;
    this.load();
  }

  BrowserSync.prototype.load = function() {
    this.filePath = path.resolve(__dirname, '../../../../build/browser-sync.js');
    this.bs = browserSync.create();
    this.config = {
      ui: {
        port: 9000
      },
      port: 9001,
      logLevel: 'silent',
      logFileChanges: false
    };
    return this.bs.init(this.config, (function(_this) {
      return function(err, bs) {
        if (err) {
          return log.error('LDE - BrowserSync', 'Couldn\'t start BrowserSync \n\n', err);
        }
        return _this.code();
      };
    })(this));
  };

  BrowserSync.prototype.code = function() {
    log.info('LDE - BrowserSync', "BrowserSync Started");
    return this.download("http://127.0.0.1:" + this.config.port + "/browser-sync/browser-sync-client." + version + ".js", (function(_this) {
      return function(err) {
        if (err) {
          return log.error('LDE - BrowserSync', "Unable to get browser-sync .js file", err);
        }
        log.info('LDE - BrowserSync', "BrowserSync ready - localhost:" + _this.config.ui.port);
        _this.server.browserify.w.add(_this.filePath);
        _this.ready = true;
        return _this.server.watch.browserify();
      };
    })(this));
  };

  BrowserSync.prototype.download = function(url, cb) {
    return mkdirp(path.dirname(this.filePath), (function(_this) {
      return function(err) {
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
