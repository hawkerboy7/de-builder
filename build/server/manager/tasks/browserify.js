var Browserify, browserify, fs, jadeify, log, path, watchify;

fs = require('fs');

path = require('path');

log = require('de-logger');

jadeify = require('jadeify');

watchify = require('watchify');

browserify = require('browserify');

Browserify = (function() {
  function Browserify(server) {
    var options;
    this.server = server;
    this.path = this.server.options.root + "/" + this.server.options.build + "/" + this.server.options.client + "/" + this.server.options.browserify.folder;
    this.name = (this.path + "/" + this.server.options.browserify.file).replace('.js', '.bundle.js');
    options = {
      cache: {},
      packageCache: {},
      debug: true,
      fullPaths: false,
      detectGlobals: false
    };
    this.w = watchify(browserify(options)).add(this.path + "/" + this.server.options.browserify.file + "/").transform(jadeify, {
      runtimePath: require.resolve('jade/runtime')
    }).on('bundle', (function(_this) {
      return function(stream) {
        return _this.write(stream);
      };
    })(this));
  }

  Browserify.prototype.compile = function() {
    this.file = fs.createWriteStream(this.name);
    log.info("LDE - Browserify", (this.server.symbols.start + " " + this.name).replace(this.server.options.root + "/", ''));
    this.s = new Date();
    return this.w.bundle();
  };

  Browserify.prototype.write = function(stream) {
    stream.pipe(this.file);
    stream.on('error', function(err) {
      if (err) {
        return log.error('LDE - Browserify', "Unable to creat bundle \n\n", err);
      }
    });
    return stream.on('end', (function(_this) {
      return function() {
        var time;
        time = (new Date().getTime() - _this.s.getTime()) / 1000;
        return log.info("LDE - Browserify", _this.server.symbols.finished + " " + time + " s");
      };
    })(this));
  };

  return Browserify;

})();

module.exports = Browserify;
