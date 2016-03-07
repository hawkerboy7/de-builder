(function() {
  var Less, fs, less, log, mkdirp, path,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  path = require('path');

  log = require('de-logger');

  mkdirp = require('mkdirp');

  less = require('less');

  Less = (function() {
    function Less(server) {
      this.server = server;
      this.less = bind(this.less, this);
      this.setup();
      this.listeners();
    }

    Less.prototype.listeners = function() {
      this.server.vent.on('less:file', this.less);
      return this.server.vent.on('watch:init', this.less);
    };

    Less.prototype.setup = function() {
      this.config = this.server.config.less;
      this.folder = this.server.folders.src.client + path.sep + this.config.folder;
      this.entry = this.folder + path.sep + this.config.entry;
      this.map = this.server.folders.build.client + path.sep + this.config.folder;
      this.destination = this.map + path.sep + this.config.file;
      return fs.stat(this.entry, (function(_this) {
        return function(e) {
          if (!e) {
            _this.type = 'single';
          } else {
            _this.type = 'multi';
            _this.determin();
          }
          return log.info(_this.server.config.title + " - Less", "Using type: " + _this.type);
        };
      })(this));
    };

    Less.prototype.determin = function() {
      this.folders = [];
      return fs.readdir(this.folder, (function(_this) {
        return function(e, files) {
          var file, folder, i, len, results;
          if (e) {
            return log.error(_this.server.config.title + " - Less", e);
          }
          results = [];
          for (i = 0, len = files.length; i < len; i++) {
            file = files[i];
            if (!fs.statSync(folder = _this.folder + path.sep + file).isDirectory()) {
              continue;
            }
            _this.folders.push(folder);
            if (_this.folders.length === 0) {
              results.push(log.error(_this.server.config.title + " - Less", "No folders are found for a multi setup"));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this));
    };

    Less.prototype.less = function(file, init) {
      if (file && !init) {
        return;
      }
      if (file) {
        log.debug(this.server.config.title + " - Less", "Change: " + file);
      }
      if (this.type === 'single') {
        return this.single(this.entry, this.folder, this.destination, this.map);
      }
    };

    Less.prototype.multi = function(file) {
      return console.log('', file);
    };

    Less.prototype.single = function(sFile, sFolder, dFile, dFolder, type) {
      return fs.readFile(sFile, 'utf8', (function(_this) {
        return function(e, res) {
          if (e) {
            log.error(_this.server.config.title + " - Less", "" + e);
            return;
          }
          return mkdirp(dFolder, function() {
            return less.render(res, {
              paths: [sFolder],
              filename: _this.config.file,
              compress: true
            }, function(e, output) {
              var css;
              if (e) {
                return log.error(_this.server.config.title + " - Less", e);
              }
              if (!(css = output != null ? output.css : void 0) && (css !== "")) {
                return log.error(_this.server.config.title + " - Less", "No css output: " + output);
              }
              return fs.writeFile(dFile, css, function(e) {
                var message;
                if (e) {
                  return log.error(_this.server.config.title + " - Less", e);
                }
                message = "";
                if (type) {
                  message = "Multi: ";
                }
                return log.info(_this.server.config.title + " - Less", message + _this.destination.replace(_this.server.root + path.sep, ''));
              });
            });
          });
        };
      })(this));
    };

    return Less;

  })();

  module.exports = Less;

}).call(this);
