var Coffee, coffee;

coffee = require('coffee-script');

Coffee = (function() {
  function Coffee(server1) {
    this.server = server1;
  }

  Coffee.prototype._compile = function(arg, next) {
    var file, server;
    file = arg.file, server = arg.server;
    return next(null, coffee.compile(file, {
      bare: server
    }));
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
