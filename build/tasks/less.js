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
      this.listeners();
    }

    Less.prototype.listeners = function() {
      this.server.vent.on('less:file', this.less);
      return this.server.vent.on('watch:init', this.less);
    };

    Less.prototype.less = function(file, init) {
      var destination, entry, folder, map;
      if (file && !init) {
        return;
      }
      if (file) {
        log.debug(this.server.config.title + " - Less", "Change: " + file);
      }
      folder = this.server.folders.src.client + path.sep + this.server.config.less.folder;
      entry = folder + path.sep + this.server.config.less.entry;
      map = this.server.folders.build.client + path.sep + this.server.config.less.folder;
      destination = map + path.sep + this.server.config.less.file;
      return fs.readFile(entry, 'utf8', (function(_this) {
        return function(e, res) {
          if (e) {
            log.error(_this.server.config.title + " - Less", "" + e);
            return;
          }
          return mkdirp(map, function() {
            return less.render(res, {
              paths: [folder],
              filename: _this.server.config.less.file,
              compress: true
            }, function(e, output) {
              var css;
              if (e) {
                return log.error(_this.server.config.title + " - Less", e);
              }
              if (!(css = output != null ? output.css : void 0) && (css !== "")) {
                return log.error(_this.server.config.title + " - Less", "No css output: " + output);
              }
              return fs.writeFile(destination, css, function(e) {
                if (e) {
                  return log.error(_this.server.config.title + " - Less", e);
                }
                return log.info(_this.server.config.title + " - Less", destination.replace(_this.server.root + path.sep, ''));
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
