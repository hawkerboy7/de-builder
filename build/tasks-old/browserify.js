// Node
var Browserify, browserify, fs, log, notifier, path, pugify;

fs = require("fs-extra");

path = require("path");

// NPM
log = require("de-logger");

pugify = require("pugify");

notifier = require("node-notifier");

browserify = require("browserify");

Browserify = class Browserify {
  constructor(server) {
    this.initialized = this.initialized.bind(this);
    this.check = this.check.bind(this);
    this.server = server;
    if (this.server.config.type === 2) {
      return;
    }
    this.setup();
    this.listeners();
  }

  setup() {
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
    // Determin build folder
    this.bFolder = this.server.folders.temp.client;
    if (this.server.config.type === 3) {
      this.bFolder = this.server.folders.temp.index;
    }
    this.bFolder += path.sep + this.config.folder;
    // Determin build file
    this.bFile = this.bFolder + path.sep + this.config.single.entry.replace(".coffee", ".js");
    // Check if entry file exists
    return fs.stat(this.sFile, (e) => {
      if (!e) {
        this.type = "single";
      } else {
        this.type = "multi";
        this.determin();
      }
      return log.info(`${this.server.config.title} - Browserify`, `Type: ${this.type}`);
    });
  }

  determin() {
    // Read all files in entry folder
    return fs.readdir(this.sFolder, (e, files) => {
      var file, folder, i, len, msg;
      if (e) {
        this.notify(msg = `Entry file not found: ${this.sFile}`);
        log.error(`${this.server.config.title} - Browserify`, `${msg}\n`, e);
        return;
      }
// Loop over all results
      for (i = 0, len = files.length; i < len; i++) {
        file = files[i];
        if (!fs.statSync(folder = this.sFolder + path.sep + file).isDirectory()) {
          // Read the results in sync otherwise the link between file and response is lost in async (due to the loop)
          continue;
        }
        // Add less bundle folders
        this.folders.push({
          name: file,
          build: this.bFolder + path.sep + file
        });
      }
      if (this.folders.length !== 0) {
        return;
      }
      return this.error();
    });
  }

  listeners() {
    this.server.vent.on("compiled:file", this.check);
    return this.server.vent.on("watch:initialized", this.initialized);
  }

  initialized() {
    var bundle, folder, i, len, name, options, ref, runtimePath;
    this.init = true;
    // Tell the bundle where to find the pug runtime
    runtimePath = require.resolve("pug-runtime");
    // On window the path with single line \ is not interpreted correctly
    runtimePath = runtimePath.replace(/\\/g, "\\\\");
    options = {
      // Add source map on envs other than production
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
        pretty: false,
        runtimePath: runtimePath,
        compileDebug: this.server.env !== "production"
      }));
      // Store starting time
      this.t = (new Date()).getTime();
      // Create bundle
      this.b.bundle();
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
          pretty: false,
          runtimePath: runtimePath,
          compileDebug: this.server.env !== "production"
        }));
        // Create bundle
        this.b[name].bundle();
      }
    }
    // Notify browser-sync
    return this.server.vent.emit("browserify:initialized", this.b);
  }

  check(arg) {
    var file;
    file = arg != null ? arg.file : void 0;
    if (!this.init) {
      return;
    }
    if (this.type === "single") {
      // Comple a single bundle if multiple bundles are not required
      this.make();
    }
    if (this.type === "multi") {
      // Compile one (or all) of the multiple bundles
      return this.multi(file);
    }
  }

  multi(file) {
    var folder, i, len, ref, results;
    if (this.folders.length === 0) {
      return this.error();
    }
    ref = this.folders;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      folder = ref[i];
      if (file) {
        if (-1 === file.indexOf(folder.temp)) {
          continue;
        }
      }
      results.push(this.make(folder.name));
    }
    return results;
  }

  make(name) {
    // Set new time stamp again
    if (name) {
      this.t[name] = (new Date()).getTime();
    } else {
      this.t = (new Date()).getTime();
    }
    if (!name) {
      // Create for single bundle
      return this.b.bundle();
    }
    // Rebuild the name specific bundle
    return this.b[name].bundle();
  }

  createBundle(name) {
    var bundle;
    return bundle = (stream) => {
      var f, message;
      message = "";
      if (name) {
        message = `Bundle '${name}' - `;
      }
      // Notify if mkdirp failed
      stream.on("error", (err) => {
        if (err) {
          this.notify(`Unable to creat bundle\n${err.message}`, name);
          log.error(`${this.server.config.title} - Browserify`, `\n${message}Unable to creat bundle\n${err.message}\n`);
        }
      });
      // Notify succes
      stream.on("end", () => {
        var dFile, destination, time;
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
        destination = dFile.replace(this.server.root + path.sep, "");
        // Notify Browserify results
        log.info(`${this.server.config.title} - Browserify`, `${message}${destination} | ${this.server.symbols.finished} ${time} s`);
        // Notify the creation of a bundle
        return this.server.vent.emit("browserify:bundle", dFile);
      });
      // Create a destination write stream
      if (name) {
        f = fs.createWriteStream(this.dFile[name]);
      } else {
        f = fs.createWriteStream(this.dFile);
      }
      // Stream into the file
      return stream.pipe(f);
    };
  }

  error() {
    var msg;
    this.notify(msg = "No folders are found for a multi setup");
    return log.error(`${this.server.config.title} - Browserify`, `\n${msg}`);
  }

  notify(message, name) {
    return notifier.notify({
      title: `${this.server.config.title} - Browserify - ${name}`,
      message: message
    });
  }

};

module.exports = Browserify;
