(function() {
  var Less, fs, less, log, mkdirp, path,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  path = require('path');

  log = require('de-logger');

  less = require('less');

  mkdirp = require('mkdirp');

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
      log.debug(this.server.config.title + " - Less", "Entry file not found: " + this.entry);
      this.folders = [];
      return fs.readdir(this.folder, (function(_this) {
        return function(e, files) {
          var file, folder, i, len;
          if (e) {
            return log.error(_this.server.config.title + " - Less", e);
          }
          for (i = 0, len = files.length; i < len; i++) {
            file = files[i];
            if (!fs.statSync(folder = _this.folder + path.sep + file).isDirectory()) {
              continue;
            }
            _this.folders.push({
              src: folder,
              bare: folder.replace(_this.server.root + path.sep, ''),
              name: file
            });
          }
          if (_this.folders.length === 0) {
            return log.error(_this.server.config.title + " - Less", "No folders are found for a multi setup");
          }
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
        this.single({
          sFile: this.entry,
          sFolder: this.folder,
          dFile: this.destination
        });
      }
      if (this.type === 'multi') {
        return this.multi(file);
      }
    };

    Less.prototype.multi = function(file) {
      var folder, i, len, ref, results;
      ref = this.folders;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        folder = ref[i];
        if (file) {
          if (-1 === file.indexOf(folder.bare)) {
            continue;
          }
        }
        results.push(this.single({
          sFile: folder.src + path.sep + 'index.less',
          sFolder: folder.src,
          dFile: this.map + path.sep + folder.name + '.css',
          name: folder.name
        }));
      }
      return results;
    };

    Less.prototype.single = function(arg) {
      var dFile, name, sFile, sFolder;
      sFile = arg.sFile, sFolder = arg.sFolder, dFile = arg.dFile, name = arg.name;
      return fs.readFile(sFile, 'utf8', (function(_this) {
        return function(e, res) {
          if (e) {
            log.error(_this.server.config.title + " - Less", "" + e);
            return;
          }
          return mkdirp(_this.map, function() {
            return less.render(res, {
              paths: [sFolder],
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
                var prefix;
                if (e) {
                  return log.error(_this.server.config.title + " - Less", e);
                }
                if (name) {
                  prefix = name + ": ";
                } else {
                  prefix = "";
                }
                return log.info(_this.server.config.title + " - Less", prefix + dFile.replace(_this.server.root + path.sep, ''));
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
