(function() {
  var Copy;

  Copy = (function() {
    function Copy(server) {
      this.server = server;
    }

    Copy.prototype._compile = function(arg, next) {
      var file;
      file = arg.file;
      return next(null, file);
    };

    Copy.prototype.compile = function(filePath) {
      var parts;
      parts = [filePath, this._compile, 'Copy'];
      return this.server.fileSystem.compile(parts);
    };

    return Copy;

  })();

  module.exports = Copy;

}).call(this);
