var Copy, fs, log, mkdirp, path,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

fs = require("fs");

path = require("path");

log = require("de-logger");

mkdirp = require("mkdirp");

Copy = (function() {
  function Copy(server) {
    this.server = server;
    this.copy = bind(this.copy, this);
    this.listeners();
  }

  Copy.prototype.listeners = function() {
    return this.server.vent.on("copy:file", this.copy);
  };

  Copy.prototype.copy = function(file, init) {
    var build, read;
    build = this.server.toBuild(file);
    read = fs.createReadStream(this.server.root + path.sep + file);
    return mkdirp(path.dirname(build), (function(_this) {
      return function() {
        var name, write;
        write = fs.createWriteStream(name = _this.server.root + path.sep + build);
        write.on("finish", function() {
          _this.server.vent.emit("compiled:file", {
            file: name,
            title: _this.server.config.title + " - Copy",
            message: "" + build
          });
          if (!init) {
            return _this.server.vent.emit("watch:increase");
          }
        });
        return read.pipe(write);
      };
    })(this));
  };

  return Copy;

})();

module.exports = Copy;
