var Browserify, browserify, fs, log, notifier, path, pugify,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

fs = require("fs");

path = require("path");

log = require("de-logger");

pugify = require("pugify");

notifier = require("node-notifier");

browserify = require("browserify");

Browserify = (function() {
  function Browserify(server) {
    this.server = server;
    this.check = bind(this.check, this);
    this.initialized = bind(this.initialized, this);
    if (this.server.config.type === 2) {
      return;
    }
    this.setup();
    this.listeners();
  }

  Browserify.prototype.setup = function() {
    this.config = this.server.config.browserify;
    this.folders = [];
    this.sFolder = this.server.folders.src.client;
    if (this.server.config.type === 3) {
      this.sFolder = this.server.folders.src.index;
    }
    this.sFolder += path.sep + this.config.folder;
    this.sFile = this.sFolder + path.sep + this.config.single.entry;
    this.bFolder = this.server.folders.build.client;
    if (this.server.config.type === 3) {
      this.bFolder = this.server.folders.build.index;
    }
    this.bFolder += path.sep + this.config.folder;
    this.bFile = this.bFolder + path.sep + this.config.single.entry.replace(".coffee", ".js");
    return fs.stat(this.sFile, (function(_this) {
      return function(e) {
        if (!e) {
          _this.type = "single";
        } else {
          _this.type = "multi";
          _this.determin();
        }
        return log.info(_this.server.config.title + " - Browserify", "Type: " + _this.type);
      };
    })(this));
  };

  Browserify.prototype.determin = function() {
    return fs.readdir(this.sFolder, (function(_this) {
      return function(e, files) {
        var file, folder, i, len, msg;
        if (e) {
          _this.notify(msg = "Entry file not found: " + _this.sFile);
          log.error(_this.server.config.title + " - Browserify", msg + "\n", e);
          return;
        }
        for (i = 0, len = files.length; i < len; i++) {
          file = files[i];
          if (!fs.statSync(folder = _this.sFolder + path.sep + file).isDirectory()) {
            continue;
          }
          _this.folders.push({
            name: file,
            build: _this.bFolder + path.sep + file
          });
        }
        if (_this.folders.length !== 0) {
          return;
        }
        return _this.error();
      };
    })(this));
  };

  Browserify.prototype.listeners = function() {
    this.server.vent.on("compiled:file", this.check);
    return this.server.vent.on("watch:initialized", this.initialized);
  };

  Browserify.prototype.initialized = function() {
    var bundle, folder, i, len, name, options, ref, runtimePath;
    this.init = true;
    runtimePath = require.resolve("pug-runtime");
    options = {
      debug: this.server.env !== "production" && this.config.debug,
      fullPaths: false
    };
    if (this.type === "single") {
      bundle = this.createBundle();
      this.dFile = this.bFolder + path.sep + this.config.single.bundle;
      this.b = browserify(options).add(this.bFile).on("bundle", bundle).on("error", function() {
        console.log("\nDexter");
        return console.log(arguments);
      });
      this.b.transform(pugify.pug({
        pretty: false,
        runtimePath: runtimePath,
        compileDebug: this.server.env !== "production"
      }));
      this.t = (new Date).getTime();
      this.b.bundle();
    }
    if (this.type === "multi") {
      this.b = {
        _browserSyncIndicator: true
      };
      this.t = {};
      this._bundle = {};
      this.dFile = {};
      ref = this.folders;
      for (i = 0, len = ref.length; i < len; i++) {
        folder = ref[i];
        name = folder.name;
        this.t[name] = (new Date).getTime();
        this._bundle[name] = this.createBundle(name);
        this.dFile[name] = this.bFolder + path.sep + name + path.sep + this.config.multi;
        this.b[name] = browserify(options).add(this.bFolder + path.sep + folder.name + path.sep + "index.js").on("bundle", this._bundle[name]).on("error", function() {
          console.log("\nDexter multi");
          return console.log(arguments);
        });
        this.b[name].transform(pugify.pug({
          pretty: false,
          runtimePath: runtimePath,
          compileDebug: this.server.env !== "production"
        }));
        this.b[name].bundle();
      }
    }
    return this.server.vent.emit("browserify:initialized", this.b);
  };

  Browserify.prototype.check = function(arg) {
    var file;
    file = arg != null ? arg.file : void 0;
    if (!this.init) {
      return;
    }
    if (this.type === "single") {
      this.make();
    }
    if (this.type === "multi") {
      return this.multi(file);
    }
  };

  Browserify.prototype.multi = function(file) {
    var folder, i, len, ref, results;
    if (this.folders.length === 0) {
      return this.error();
    }
    ref = this.folders;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      folder = ref[i];
      if (file) {
        if (-1 === file.indexOf(folder.build)) {
          continue;
        }
      }
      results.push(this.make(folder.name));
    }
    return results;
  };

  Browserify.prototype.make = function(name) {
    if (name) {
      this.t[name] = (new Date).getTime();
    } else {
      this.t = (new Date).getTime();
    }
    if (!name) {
      return this.b.bundle();
    }
    return this.b[name].bundle();
  };

  Browserify.prototype.createBundle = function(name) {
    var bundle;
    return bundle = (function(_this) {
      return function(stream) {
        var f, message;
        message = "";
        if (name) {
          message = "Bundle '" + name + "' - ";
        }
        stream.on("error", function(err) {
          if (err) {
            _this.notify("Unable to creat bundle\n" + err.message, name);
            log.error(_this.server.config.title + " - Browserify", "\n" + message + "Unable to creat bundle\n" + err.message + "\n");
          }
        });
        stream.on("end", function() {
          var dFile, destination, time;
          time = _this.t;
          if (name) {
            time = _this.t[name];
          }
          time = (new Date().getTime() - time) / 1000;
          dFile = _this.dFile;
          if (name) {
            dFile = _this.dFile[name];
          }
          destination = dFile.replace(_this.server.root + path.sep, "");
          log.info(_this.server.config.title + " - Browserify", "" + message + destination + " | " + _this.server.symbols.finished + " " + time + " s");
          return _this.server.vent.emit("browserify:bundle", dFile);
        });
        if (name) {
          f = fs.createWriteStream(_this.dFile[name]);
        } else {
          f = fs.createWriteStream(_this.dFile);
        }
        return stream.pipe(f);
      };
    })(this);
  };

  Browserify.prototype.error = function() {
    var msg;
    this.notify(msg = "No folders are found for a multi setup");
    return log.error(this.server.config.title + " - Browserify", "\n" + msg);
  };

  Browserify.prototype.notify = function(message, name) {
    return notifier.notify({
      title: this.server.config.title + " - Browserify - " + name,
      message: message
    });
  };

  return Browserify;

})();

module.exports = Browserify;
