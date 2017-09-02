var Coffee, coffee, fs, log, mkdirp, notifier, path,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

fs = require("fs");

path = require("path");

log = require("de-logger");

mkdirp = require("mkdirp");

coffee = require("coffee-script");

notifier = require("node-notifier");

Coffee = (function() {
  function Coffee(server) {
    this.server = server;
    this.coffee = bind(this.coffee, this);
    this.listeners();
  }

  Coffee.prototype.listeners = function() {
    return this.server.vent.on("coffee:file", this.coffee);
  };

  Coffee.prototype.coffee = function(file, init) {
    var build;
    build = this.server.toBuild(file).replace(".coffee", ".js");
    return fs.readFile(this.server.root + path.sep + file, {
      encoding: "utf-8"
    }, (function(_this) {
      return function(err, data) {
        if (err) {
          _this.notify(err.message);
          return log.error(err);
        }
        return mkdirp(path.dirname(build), function() {
          var coffeeScript, e, msg, name;
          try {
            coffeeScript = coffee.compile(data, {
              bare: true
            });
          } catch (error) {
            e = error;
            coffeeScript = "";
            _this.notify(msg = file + "\nLine: " + e.location.first_line + "\n" + e.message);
            log.error(_this.server.config.title + " - Coffee", "\n" + msg, "\n", e.code);
          }
          return fs.writeFile(name = _this.server.root + path.sep + build, coffeeScript, function(err) {
            if (err) {
              _this.notify(err.message);
              return log.error(err);
            }
            _this.server.vent.emit("compiled:file", {
              file: name,
              title: _this.server.config.title + " - Coffee",
              message: "" + build
            });
            if (!init) {
              return _this.server.vent.emit("watch:increase");
            }
          });
        });
      };
    })(this));
  };

  Coffee.prototype.notify = function(message) {
    return notifier.notify({
      title: this.server.config.title + " - Coffee",
      message: message
    });
  };

  return Coffee;

})();

module.exports = Coffee;
