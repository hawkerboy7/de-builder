var Coffee, coffee, fs, log, mkdirp, path,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

fs = require('fs');

path = require('path');

log = require('de-logger');

mkdirp = require('mkdirp');

coffee = require('coffee-script');

Coffee = (function() {
  function Coffee(server) {
    this.server = server;
    this.coffee = bind(this.coffee, this);
    this.listeners();
  }

  Coffee.prototype.listeners = function() {
    return this.server.vent.on('coffee:file', this.coffee);
  };

  Coffee.prototype.coffee = function(file, init) {
    var build;
    build = this.server.toBuild(file).replace('.coffee', '.js');
    return fs.readFile(this.server.root + path.sep + file, {
      encoding: 'utf-8'
    }, (function(_this) {
      return function(err, data) {
        if (err) {
          return log.error(err);
        }
        return mkdirp(path.dirname(build), function() {
          var coffeeScript, e, error, name;
          try {
            coffeeScript = coffee.compile(data, {
              bare: true
            });
          } catch (error) {
            e = error;
            coffeeScript = "";
            log.error(_this.server.config.title + " - Coffee", file, e.message, e.location);
          }
          return fs.writeFile(name = _this.server.root + path.sep + build, coffeeScript, function(err) {
            if (err) {
              return log.error(err);
            }
            _this.server.vent.emit('compiled:file', {
              file: name,
              title: _this.server.config.title + " - Coffee",
              message: "" + build
            });
            if (!init) {
              return _this.server.vent.emit('watch:increase');
            }
          });
        });
      };
    })(this));
  };

  return Coffee;

})();

module.exports = Coffee;
