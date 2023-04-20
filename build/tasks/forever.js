// Node
var Forever, log, nodemon, path;

path = require("path");

// NPM
log = require("de-logger");

nodemon = require("nodemon");

Forever = class Forever {
  constructor(server) {
    this.exit = this.exit.bind(this);
    this.start = this.start.bind(this);
    this.terminate = this.terminate.bind(this);
    this.server = server;
    this.listeners();
    this.server.forever = {
      run: this.start
    };
  }

  listeners() {
    return process.on("exit", this.exit);
  }

  exit(code) {
    log.info(`${this.server.config.title} - Watch`, "~ And Now My Watch Is Ended ~");
    return this.terminate();
  }

  start() {
    var entry, src;
    // Determin the src directory
    src = this.server.folders.build.server;
    if (this.server.config.type === 2) {
      src = this.server.folders.build.index;
    }
    // Create file path
    entry = src + path.sep + this.server.config.forever.entry;
    // Ensure no previous instance is runnning
    this.terminate();
    // Ensure we work with a clean slate of nodemon
    nodemon.reset();
    // Start running the application
    return nodemon({
      script: entry,
      ext: "js",
      ignore: ["*"]
    });
  }

  terminate() {
    // Close the currently running app in case it is running
    nodemon.emit("SIGINT");
    return nodemon.emit("quit");
  }

};

module.exports = Forever;
