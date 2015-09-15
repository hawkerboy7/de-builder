(function() {
  var Clean, fs, log;

  fs = require('fs');

  log = require('de-logger');

  Clean = (function() {
    function Clean(server) {
      this.server = server;
    }

    Clean.prototype.start = function(next) {
      this.buildFolder = this.server.options.root + "/" + this.server.options.build + "/";
      this.serverFolder = this.server.options.root + "/" + this.server.options.build + "/" + this.server.options.server;
      this.clientFolder = this.server.options.root + "/" + this.server.options.build + "/" + this.server.options.client;
      if (this.server.options.type === 1) {
        this.remove(this.serverFolder);
        this.remove(this.clientFolder);
        log.info('LDE - Clean', this.server.symbols.finished);
      }
      if (this.server.options.type === 2 || this.server.options.type === 3) {
        this.remove(this.buildFolder);
        log.info('LDE - Clean', this.server.symbols.finished);
      }
      return next();
    };

    Clean.prototype.remove = function(dirPath) {
      var filePath, files, i;
      files = fs.readdirSync(dirPath);
      if (files.length > 0) {
        for (i in files) {
          if (!files.hasOwnProperty(i)) {
            return;
          }
          filePath = dirPath + '/' + files[i];
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          } else {
            this.remove(filePath);
          }
        }
      }
      if (!(dirPath === this.serverFolder || dirPath === this.clientFolder)) {
        return fs.rmdirSync(dirPath);
      }
    };

    return Clean;

  })();

  module.exports = Clean;

}).call(this);
