// Node
var Browserify, browserify, fs, log, path, pugify, uglifyify;

fs = require("fs-extra");

path = require("path");

// NPM
log = require("de-logger");

pugify = require("pugify");

uglifyify = require("@browserify/uglifyify");

browserify = require("browserify");

Browserify = class Browserify {
  constructor(server) {
    this.process = this.process.bind(this);
    this.server = server;
    this.server.browserify = {
      process: this.process
    };
  }

  init() {
    return new Promise(async(resolve) => {
      if (this.server.config.type !== 2) {
        await this.load();
        this.initialize();
      }
      return resolve();
    });
  }

  load() {
    return new Promise(async(resolve) => {
      var e, stats, type;
      // Short reference to browserify config
      this.config = this.server.config.browserify;
      // Store multi setup folders
      this.folders = [];
      // Determin source folder
      this.sFolder = this.server.folders.src.client;
      if (this.server.config.type === 3) {
        this.sFolder = this.server.folders.src.index;
      }
      this.sFolder += path.sep + this.config.folder;
      // Determin source file
      this.sFile = this.sFolder + path.sep + this.config.single.entry;
      type = "temp";
      if (this.server.initialized) {
        type = "build";
      }
      // Determin build folder
      this.bFolder = this.server.folders[type].client;
      if (this.server.config.type === 3) {
        this.bFolder = this.server.folders[type].index;
      }
      this.bFolder += path.sep + this.config.folder;
      // Determin build file
      this.bFile = this.bFolder + path.sep + this.config.single.entry.replace(".coffee", ".js");
      try {
        // Check if entry file exists
        stats = fs.statSync(this.sFile);
      } catch (error) {
        e = error;
      }
      if (e) {
        this.type = "multi";
        await this.determin();
      } else {
        this.type = "single";
      }
      log.info(`${this.server.config.title} - Browserify`, `Type: ${this.type}`);
      if (this.server.uglify) {
        log.info(`${this.server.config.title} - Browserify`, "Uglify applied");
      }
      return resolve();
    });
  }

  determin() {
    return new Promise(async(resolve) => {
      var e, file, files, folder, i, len;
      try {
        files = (await fs.readdir(this.sFolder));
      } catch (error) {
        e = error;
        return log.error(`${this.server.config.title} - Browserify`, `Entry file not found: ${this.sFile}\n`, e.stack);
      }
      for (i = 0, len = files.length; i < len; i++) {
        file = files[i];
        if (!fs.statSync(folder = this.sFolder + path.sep + file).isDirectory()) {
          continue;
        }
        this.folders.push({
          name: file,
          path: this.bFolder + path.sep + file
        });
      }
      if (this.folders.length === 0) {
        log.error(`${this.server.config.title} - Browserify`, "No folders are found for a multi setup");
      }
      return resolve();
    });
  }

  initialize() {
    var bundle, folder, i, len, name, options, ref;
    options = {
      // Add source map on envs other than production when debug is true
      debug: this.server.env !== "production" && this.config.debug,
      // Do not show paths to files in the app.bundle.js
      fullPaths: false
    };
    if (this.type === "single") {
      bundle = this.createBundle();
      // Create bundle stream
      this.dFile = this.bFolder + path.sep + this.config.single.bundle;
      // Store browserify bundle
      // Add user entry file
      // Stream the bundle to a file write stream
      // Handle error
      this.b = browserify(options).add(this.bFile).on("bundle", bundle).on("error", function() {
        console.log("\nDexter");
        return console.log(arguments);
      });
      // Allow for .pug files to be added into the bundle
      this.b.transform(pugify.pug({
        compileDebug: this.server.env !== "production"
      }));
      if (this.server.uglify) {
        this.b.transform(uglifyify, {
          sourceMap: false
        });
      }
      // Store starting time
      this.t = (new Date()).getTime();
    }
    if (this.type === "multi") {
      // Store browserify bundles
      this.b = {
        // Tells browser-sync if type is multi or single
        _browserSyncIndicator: true
      };
      // Store bundle times
      this.t = {};
      // Store different bundles
      this._bundle = {};
      // Store destination files
      this.dFile = {};
      ref = this.folders;
      for (i = 0, len = ref.length; i < len; i++) {
        folder = ref[i];
        // Get folder name
        name = folder.name;
        // Store time
        this.t[name] = (new Date()).getTime();
        // Create bundle by name
        this._bundle[name] = this.createBundle(name);
        // Create bundle output stream path
        this.dFile[name] = this.bFolder + path.sep + name + path.sep + this.config.multi;
        // Store browserify bundle
        // Add user entry file
        // Stream the bundle to a file write stream
        // Handle error
        this.b[name] = browserify(options).add(this.bFolder + path.sep + folder.name + path.sep + "index.js").on("bundle", this._bundle[name]).on("error", function() {
          console.log("\nDexter multi");
          return console.log(arguments);
        });
        // Allow for .pug files to be added into the bundle
        this.b[name].transform(pugify.pug({
          compileDebug: this.server.env !== "production"
        }));
        if (this.server.uglify) {
          this.b[name].transform(uglifyify, {
            sourceMap: false
          });
        }
      }
    }
    // Expose the bundle(s) for browser-sync
    return this.server.browserify.w = this.b;
  }

  process(file) {
    return new Promise(async(resolve) => {
      if (this.server.config.type === 2) {
        return resolve();
      }
      if (!file) {
        log.info(`${this.server.config.title} - Browserify`, "Init");
      }
      if (this.type === "multi") {
        await this.multi(file);
      } else if (this.type === "single") {
        await this.make();
      }
      return resolve();
    });
  }

  multi(file) {
    return new Promise(async(resolve) => {
      var folder, folderFile, folderSrc, i, items, key, len, list, promise, ref;
      if (this.folders.length === 0) {
        return resolve();
      }
      list = {};
      ref = this.folders;
      for (i = 0, len = ref.length; i < len; i++) {
        folder = ref[i];
        if (file) {
          folderFile = file.split("/")[3];
          folderSrc = (items = folder.path.split("/"))[items.length - 1];
          if (folderFile !== folderSrc) {
            continue;
          }
        }
        list[folder.name] = this.make(folder.name);
      }
      for (key in list) {
        promise = list[key];
        await promise;
      }
      return resolve();
    });
  }

  make(name) {
    return new Promise((resolve) => {
      if (name) {
        this.t[name] = (new Date()).getTime();
      } else {
        this.t = (new Date()).getTime();
      }
      if (name) {
        return this.b[name].bundle().on("end", resolve);
      } else {
        return this.b.bundle().on("end", resolve);
      }
    });
  }

  createBundle(name) {
    var bundle;
    return bundle = (stream) => {
      var destination, message;
      message = "";
      if (name) {
        message = `Bundle '${name}' - `;
      }
      log.info("", `Building bundle '${name}'`);
      // Notify if mkdirp failed
      stream.on("error", (err) => {
        console.log("stream error");
        if (err) {
          return log.error(`${this.server.config.title} - Browserify`, `\n${message}Unable to creat bundle\n${err.message}`);
        }
      });
      // Notify succes
      stream.on("end", () => {
        var dFile, dest, time;
        // Determin time
        time = this.t;
        if (name) {
          time = this.t[name];
        }
        // Calculate time differenve from the start of browserify
        time = (new Date().getTime() - time) / 1000;
        // Determin destination file
        dFile = this.dFile;
        if (name) {
          dFile = this.dFile[name];
        }
        // Make the resulting path pretty
        dest = dFile.replace(this.server.root + path.sep, "");
        // Notify Browserify results
        return log.info(`${this.server.config.title} - Browserify`, `${message}${dest} | ${this.server.symbols.finished} ${time} s`);
      });
      destination = this.dFile;
      if (name) {
        destination = this.dFile[name];
      }
      destination = destination.replace(this.server.root + path.sep, "");
      destination = this.server.toDestination(destination);
      // Stream into the file
      return stream.pipe(fs.createWriteStream(this.server.root + path.sep + destination));
    };
  }

};

module.exports = Browserify;
