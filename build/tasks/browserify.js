(function() {
  var Browserify, browserify, fs, jadeify, log, path, watchify,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  path = require('path');

  log = require('de-logger');

  jadeify = require('jadeify');

  watchify = require('watchify');

  browserify = require('browserify');

  Browserify = (function() {
    function Browserify(server) {
      this.server = server;
      this.check = bind(this.check, this);
      this.initialized = bind(this.initialized, this);
      if ((this.type = this.server.config.type) === 2) {
        return;
      }
      this.setup();
      this.listeners();
    }

    Browserify.prototype.setup = function() {
      this.config = this.server.config.browserify;
      this.folders = [];
      this.folder = this.server.folders.src.client;
      if (this.type === 2) {
        this.folder = this.server.folders.src.index;
      }
      this.folder += path.sep + this.config.folder;
      this.entry = this.folder + path.sep + this.config.entry;
      this.destination = this.server.folders.build.client;
      if (this.type === 2) {
        this.destination = this.server.folders.build.index;
      }
      this.destination += path.sep + this.config.folder;
      return fs.stat(this.entry, (function(_this) {
        return function(e) {
          if (!e) {
            _this.type = 'single';
          } else {
            _this.type = 'multi';
            _this.determin();
          }
          return log.info(_this.server.config.title + " - Browserify", "Type: " + _this.type);
        };
      })(this));
    };

    Browserify.prototype.determin = function() {
      log.debug(this.server.config.title + " - Browserify", "Entry file not found: " + this.entry);
      return fs.readdir(this.folder, (function(_this) {
        return function(e, files) {
          var file, folder, i, len;
          if (e) {
            return log.error(_this.server.config.title + " - Browserify", e);
          }
          for (i = 0, len = files.length; i < len; i++) {
            file = files[i];
            if (!fs.statSync(folder = _this.folder + path.sep + file).isDirectory()) {
              continue;
            }
            _this.folders.push({
              name: file,
              build: _this.destination + path.sep + file
            });
          }
          if (_this.folders.length === 0) {
            return _this.error();
          }
        };
      })(this));
    };

    Browserify.prototype.listeners = function() {
      this.server.vent.on('compiled:file', this.check);
      return this.server.vent.on('watch:initialized', this.initialized);
    };

    Browserify.prototype.initialized = function() {
      var folder, i, len, options, ref, results;
      this.init = true;
      options = {
        cache: {},
        packageCache: {},
        debug: this.server.options.browserify.debug,
        fullPaths: false
      };
      if (this.type === 'single') {
        this.f = fs.createWriteStream(this.destination + path.sep + this.config);
        this.w = watchify(browserify(options)).add(this.entry).transform(jadeify, {
          runtimePath: require.resolve('jade/runtime')
        }).on('bundle', this.single);
      }
      if (this.type === 'multi') {
        this.f = {};
        this.w = {};
        ref = this.folders;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          folder = ref[i];
          this.f[folder.name] = fs.createWriteStream(this.name);
          results.push(this.w[folder.name] = watchify(browserify(options)));
        }
        return results;
      }
    };

    Browserify.prototype.check = function(arg) {
      var file;
      file = arg != null ? arg.file : void 0;
      if (!this.init) {
        return;
      }
      if (this.type === 'single') {
        this.make();
      }
      if (this.type === 'multi') {
        return this.multi(file);
      }
    };

    Browserify.prototype.multi = function(file) {
      var folder, i, len, ref, results;
      if (this.folders.length === 0) {
        return this.error();
      }
      ref = this.folders;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        folder = ref[i];
        if (file) {
          if (-1 === file.indexOf(folder.build)) {
            continue;
          }
        }
        results.push(this.make());
      }
      return results;
    };

    Browserify.prototype.make = function() {};

    Browserify.prototype.single = function(stream) {
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

    Browserify.prototype.error = function() {
      return log.error(this.server.config.title + " - Browserify", "No folders are found for a multi setup");
    };

    return Browserify;

  })();

  module.exports = Browserify;

}).call(this);
