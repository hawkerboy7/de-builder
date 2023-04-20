// Node
var EventEmitter, Server, cfg, extend, log, path, pkg;

path = require("path");

({EventEmitter} = require("events"));

// NPM
log = require("de-logger");

extend = require("deep-extend");

// Config
cfg = require("./config");

pkg = require("../../package.json");

Server = class Server {
  constructor(config) {
    // Set package
    this.pkg = pkg;
    // Extend config with provided config
    this.config = extend(cfg, config);
    // Set project info
    this.config.title = "LDE";
    this.config.fullTitle = "Live Development Environment";
    // Set title of the process
    process.title = this.pkg.name;
    // Set the value of debug messages logged
    log.set({
      debug: {
        display: this.config.debug
      }
    });
    // Check all provided arguments
    this.argv();
    // Notify start of project
    log.info(this.config.title, `${this.config.fullTitle} (${this.config.title}) started in: ${this.env}`);
    log.info(this.config.title, `Process title: ${this.pkg.name}`);
    // Load server
    this.load();
  }

  load(cb) {
    // Store symbols
    this.symbols = {
      start: "•",
      finished: "✔"
    };
    // Set the root folder of the project that de-builder is working for
    this.root = path.resolve("./");
    // Root of de-builder
    this.myRoot = path.resolve(__dirname, "../../");
    // Set an event emitter
    this.vent = new EventEmitter();
    // From src to temp or build foler
    return this.toDestination = (file) => {
      var seperated;
      // Seperate path
      seperated = file.split(path.sep);
      // Remove first entry (src folder)
      seperated.shift();
      // File to remove in the build folder
      return this.config[this.initialized ? "build" : "temp"] + path.sep + seperated.join(path.sep);
    };
  }

  argv() {
    var arg, i, len, ref, run, uglify;
    // Default values
    this.env = "development";
    this.run = true;
    ref = process.argv;
    for (i = 0, len = ref.length; i < len; i++) {
      arg = ref[i];
      if (arg[0] !== "-") {
        continue;
      }
      if (arg === "-prod") {
        this.env = "production";
        this.run = false;
        this.uglify = true;
        continue;
      }
      if (arg === "-debug") {
        log.set({
          debug: {
            display: true
          }
        });
        continue;
      }
      if (arg === "-uglify") {
        uglify = true;
        continue;
      }
      if (arg === "-no-uglify") {
        uglify = false;
        continue;
      }
      if (arg === "-run") {
        run = true;
      }
    }
    if (run) {
      // Ensure the order of -prod and -run does not matter
      this.run = true;
    }
    if (uglify != null) {
      // Allow for overwriting the uglify setting when running in any environment
      return this.uglify = uglify;
    }
  }

};

module.exports = Server;
