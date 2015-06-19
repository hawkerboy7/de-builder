(function() {
  var Watch, chokidar, log, path;

  log = require('de-logger');

  path = require('path');

  chokidar = require('chokidar');

  Watch = (function() {
    function Watch(server) {
      this.server = server;
    }

    Watch.prototype.start = function() {
      var sub;
      log.info('LDE - Watch', "~ Night gathers, and now my watch begins ~");
      sub = "";
      if (this.server.options.type !== 2) {
        sub = this.server.options.server + "/";
      }
      this.src = this.server.options.root + "/" + this.server.options.src + "/";
      this.foreverRestart = this.server.options.root + "/" + this.server.options.build + "/" + sub;
      this.browserifyRebuild = this.server.options.root + "/" + this.server.options.build + "/" + this.server.options.client + "/" + this.server.options.browserify.folder + "/";
      this.browserifyServer = this.server.options.root + "/" + this.server.options.build + "/" + this.server.options.browserify.folder + "/";
      return this.watcher();
    };

    Watch.prototype.watcher = function() {
      chokidar.watch(this.src, {
        ignored: /[\/\\]\./
      }).on('add', (function(_this) {
        return function(filePath) {
          return _this.check(filePath);
        };
      })(this)).on('change', (function(_this) {
        return function(filePath) {
          return _this.check(filePath);
        };
      })(this)).on('unlink', (function(_this) {
        return function(filePath) {
          return _this.remove(filePath);
        };
      })(this)).on('ready', (function(_this) {
        return function() {
          if (_this.server.options.type === 3) {
            _this.watcher2();
          }
          return setTimeout(function() {
            _this.server.ready = true;
            if (_this.server.options.type === 1 || _this.server.options.type === 3) {
              _this.browserify();
            }
            if (_this.server.options.type === 1 || _this.server.options.type === 2) {
              return _this.forever();
            }
          }, 250);
        };
      })(this));
      if (this.server.options.type === 1) {
        chokidar.watch(this.browserifyRebuild, {
          ignored: [/[\/\\]\./, (this.browserifyRebuild + "/" + this.server.options.browserify.file).replace('.js', '.bundle.js')]
        }).on('add', (function(_this) {
          return function(filePath) {
            return _this.browserify();
          };
        })(this)).on('change', (function(_this) {
          return function(filePath) {
            return _this.browserify();
          };
        })(this)).on('unlink', (function(_this) {
          return function(filePath) {
            return _this.browserify();
          };
        })(this));
      }
      if (this.server.options.type === 1 || this.server.options.type === 2) {
        return chokidar.watch(this.foreverRestart, {
          ignored: /[\/\\]\./
        }).on('change', (function(_this) {
          return function(filePath) {
            return _this.forever();
          };
        })(this)).on('unlink', (function(_this) {
          return function(filePath) {
            return _this.forever();
          };
        })(this));
      }
    };

    Watch.prototype.watcher2 = function() {
      if (this.server.options.type === 3) {
        return chokidar.watch(this.browserifyServer, {
          ignored: [/[\/\\]\./, (this.browserifyServer + "/" + this.server.options.browserify.file).replace('.js', '.bundle.js')]
        }).on('add', (function(_this) {
          return function(filePath) {
            return _this.browserify();
          };
        })(this)).on('change', (function(_this) {
          return function(filePath) {
            return _this.browserify();
          };
        })(this)).on('unlink', (function(_this) {
          return function(filePath) {
            return _this.browserify();
          };
        })(this));
      }
    };

    Watch.prototype.check = function(filePath) {
      var extention;
      extention = path.extname(filePath);
      log.debug('LDE - Watch', "Add/Change: " + filePath.replace(this.server.options.root + "/", ''));
      if (extention === '.less') {
        return this.server.less.compile(filePath);
      }
      if (extention === '.coffee') {
        return this.server.coffee.compile(filePath);
      }
      return this.server.copy.compile(filePath);
    };

    Watch.prototype.remove = function(filePath) {
      return console.log('Remove file', filePath);
    };

    Watch.prototype.browserify = function() {
      if (!this.server.ready) {
        return;
      }
      if (!this.server.browserSync.ready) {
        return;
      }
      log.debug('LDE - Watch', "Browserify triggered");
      return this.server.browserify.compile();
    };

    Watch.prototype.forever = function() {
      if (!this.server.ready) {
        return;
      }
      log.debug('LDE - Watch', "Forever triggered");
      return this.server.forever.start();
    };

    return Watch;

  })();

  module.exports = Watch;

}).call(this);
