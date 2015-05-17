(function() {
  var Browserify, browserify, fs, jadeify, log, path, watchify;

  fs = require('fs');

  path = require('path');

  log = require('de-logger');

  jadeify = require('jadeify');

  watchify = require('watchify');

  browserify = require('browserify');

  Browserify = (function() {
    function Browserify(server) {
      var options;
      this.server = server;
      this.path = this.server.options.root + "/" + this.server.options.build + "/" + this.server.options.client + "/" + this.server.options.browserify.folder;
      if (this.server.options.type === 3) {
        this.path = this.server.options.root + "/" + this.server.options.build + "/" + this.server.options.browserify.folder;
      }
      this.name = (this.path + "/" + this.server.options.browserify.file).replace('.js', '.bundle.js');
      this.entry = this.path + "/" + this.server.options.browserify.file;
      options = {
        cache: {},
        packageCache: {},
        debug: true,
        fullPaths: false
      };
      if (this.server.options.type === 3) {
        options.debug = false;
        options.builtins = false;
      }
      this.w = watchify(browserify(options)).add(this.entry).transform(jadeify, {
        runtimePath: require.resolve('jade/runtime')
      }).on('bundle', (function(_this) {
        return function(stream) {
          return _this.write(stream);
        };
      })(this));
    }

    Browserify.prototype.compile = function() {
      return fs.exists(this.entry, (function(_this) {
        return function(bool) {
          if (!bool) {
            return log.warn('LDE - Browserify', 'Entry file doesn\'t exist', _this.entry.replace(_this.server.options.root + "/", ''));
          }
          _this.file = fs.createWriteStream(_this.name);
          log.info("LDE - Browserify", (_this.server.symbols.start + " " + _this.name).replace(_this.server.options.root + "/", ''));
          _this.s = new Date();
          return _this.w.bundle();
        };
      })(this));
    };

    Browserify.prototype.write = function(stream) {
      stream.pipe(this.file);
      stream.on('error', function(err) {
        if (err) {
          return log.error('LDE - Browserify', "Unable to creat bundle \n\n", err);
        }
      });
      return stream.on('end', (function(_this) {
        return function() {
          var time;
          time = (new Date().getTime() - _this.s.getTime()) / 1000;
          log.info("LDE - Browserify", _this.server.symbols.finished + " " + time + " s");
          return _this.server.browserSync.reload(_this.name);
        };
      })(this));
    };

    return Browserify;

  })();

  module.exports = Browserify;

}).call(this);
