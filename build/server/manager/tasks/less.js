var Less, Server, fs, less;

fs = require('fs');

less = require('less');

Server = null;

Less = (function() {
  function Less(server) {
    this.server = server;
    Server = this.server;
  }

  Less.prototype._compile = function(arg, next) {
    var entry, file, filePath, path;
    file = arg.file, filePath = arg.filePath;
    path = Server.options.root + "/" + Server.options.src + "/" + Server.options.client + "/" + Server.options.less.folder;
    entry = path + "/" + Server.options.less.file;
    if (filePath === entry) {
      Server.files.less = file;
    } else {
      if (!Server.ready) {
        return;
      }
    }
    if (!Server.files.less) {
      return;
    }
    return less.render(Server.files.less, {
      paths: [path],
      filename: "" + Server.options.less.file,
      compress: true
    }, function(e, output) {
      return next(e, output != null ? output.css : void 0, true);
    });
  };

  Less.prototype.compile = function(filePath) {
    var parts;
    parts = [
      filePath, this._compile, 'Less', {
        src: '.less',
        target: '.css'
      }
    ];
    return this.server.fileSystem.compile(parts);
  };

  return Less;

})();

module.exports = Less;
