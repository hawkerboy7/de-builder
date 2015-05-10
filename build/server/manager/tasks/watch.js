var Watch, chokidar, log, path;

log = require('de-logger');

path = require('path');

chokidar = require('chokidar');

Watch = (function() {
  function Watch(server) {
    this.server = server;
  }

  Watch.prototype.start = function() {
    log.info('LDE - Watch', "~ Night gathers, and now my watch begins ~");
    this.src = this.server.options.root + "/" + this.server.options.src;
    this.build = this.server.options.root + "/" + this.server.options.build + "/" + this.server.options.client + "/" + this.server.options.browserify.folder;
    if (this.server.options.type === 1) {
      return this.typeOne();
    }
  };

  Watch.prototype.typeOne = function() {
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
        return setTimeout(function() {
          _this.server.ready = true;
          _this.browserify();
          return _this.forever();
        }, 100);
      };
    })(this));
    return chokidar.watch(this.build, {
      ignored: [/[\/\\]\./, (this.build + "/" + this.server.options.browserify.file).replace('.js', '.bundle.js')]
    }).on('add', (function(_this) {
      return function(filePath) {
        return _this.browserify(filePath);
      };
    })(this)).on('change', (function(_this) {
      return function(filePath) {
        return _this.browserify(filePath);
      };
    })(this)).on('unlink', (function(_this) {
      return function(filePath) {
        return _this.browserify(filePath);
      };
    })(this));
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
    return console.log('remove file in the build folder: ', filePath);
  };

  Watch.prototype.browserify = function(filePath) {
    if (!this.server.ready) {
      return;
    }
    return this.server.browserify.compile();
  };

  Watch.prototype.forever = function() {
    return this.server.forever.start();
  };

  return Watch;

})();

module.exports = Watch;
