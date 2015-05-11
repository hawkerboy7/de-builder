var FileSystem, fs, log, mkdirp, path;

fs = require('fs');

log = require('de-logger');

path = require('path');

mkdirp = require('mkdirp');

FileSystem = (function() {
  function FileSystem(server1) {
    this.server = server1;
  }

  FileSystem.prototype.compile = function(parts) {
    var _compile, extentions, filePath, task;
    filePath = parts[0], _compile = parts[1], task = parts[2], extentions = parts[3];
    return fs.readFile(filePath, (function(_this) {
      return function(err, file) {
        var dirPath, newPath;
        if (err) {
          return log.error('LDE - FileSystem', "Unable to readFile " + filePath + "\n\n", err);
        }
        newPath = filePath.replace(_this.server.options.root + "/" + _this.server.options.src, _this.server.options.root + "/" + _this.server.options.build);
        if (extentions) {
          newPath = newPath.replace("" + extentions.src, "" + extentions.target);
        }
        dirPath = path.dirname(newPath);
        if ((extentions != null ? extentions.src : void 0) === '.less') {
          dirPath = _this.server.options.root + "/" + _this.server.options.build + "/" + _this.server.options.client + "/" + _this.server.options.less.folder;
        }
        return mkdirp(dirPath, function(err) {
          var server;
          if (err) {
            return log.error('LDE - FileSystem', "Unable to create " + dirPath + "\n\n", err);
          }
          server = true;
          if (-1 === filePath.indexOf(_this.server.options.root + "/" + _this.server.options.src + "/" + _this.server.options.server)) {
            server = false;
          }
          if (task !== 'Copy') {
            file = file.toString();
          }
          return _compile({
            file: file,
            server: server,
            filePath: filePath
          }, function(err, result) {
            if (err) {
              return log.error("LDE - _Compile " + task, "Unable to compile " + filePath + "\n\n", err);
            }
            if ((extentions != null ? extentions.src : void 0) === '.less') {
              newPath = (_this.server.options.root + "/" + _this.server.options.build + "/" + _this.server.options.client + "/" + _this.server.options.less.folder + "/" + _this.server.options.less.file).replace("" + extentions.src, "" + extentions.target);
            }
            log.info("LDE - " + task, newPath.replace(_this.server.options.root + "/", ''));
            return fs.writeFile(newPath, result, function(err) {
              if (err) {
                return log.error('LDE - FileSystem', "Unable to write file " + newPath + "\n\n", err);
              }
              if (server) {
                return;
              }
              if ((extentions != null ? extentions.src : void 0) === '.less') {
                _this.server.browserSync.reload(newPath);
              }
              if (filePath.indexOf('.jade') !== -1) {
                return _this.server.browserSync.reload(newPath);
              }
            });
          });
        });
      };
    })(this));
  };

  return FileSystem;

})();

module.exports = FileSystem;
