(function() {
  var Coffee, coffee;

  coffee = require('coffee-script');

  Coffee = (function() {
    function Coffee(server1) {
      this.server = server1;
    }

    Coffee.prototype._compile = function(arg, next) {
      var e, error, file, server;
      file = arg.file, server = arg.server;
      try {
        return next(null, coffee.compile(file, {
          bare: server
        }));
      } catch (error) {
        e = error;
        return next(e);
      }
    };

    Coffee.prototype.compile = function(filePath) {
      var parts;
      parts = [
        filePath, this._compile, 'Coffee', {
          src: '.coffee',
          target: '.js'
        }
      ];
      return this.server.fileSystem.compile(parts);
    };

    return Coffee;

  })();

  module.exports = Coffee;

}).call(this);
