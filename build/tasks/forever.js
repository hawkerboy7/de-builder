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

  async start() {
    var entry, src;
    // Determin the src directory
    src = this.server.folders.build.server;
    if (this.server.config.type === 2) {
      src = this.server.folders.build.index;
    }
    // Create file path
    entry = src + path.sep + this.server.config.forever.entry;
    // --------------------------------------------------
    // Due to issues with nodemon we run everything a bit slower to hopefully
    // let the async parts complete
    // - TypeError: Cannot read properties of undefined (reading 'script')
    // - [not solved] MaxListenersExceededWarning: Possible EventEmitter memory leak detected
    // --------------------------------------------------

    // Ensure no previous instance is runnning
    await this.terminate();
    // Ensure we work with a clean slate of nodemon
    nodemon.reset();
    // Wait a small time to ensure the reset is completed and possibly also
    // for the the entry file being flushed to disk. 100ms seems to be enough after some testing
    await new Promise((resolve) => {
      return setTimeout(resolve, 100);
    });
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
    nodemon.emit("quit");
    // Allow a little time for the application run by nodemon to close
    return new Promise((resolve) => {
      return setTimeout(resolve, 10);
    });
  }

};

module.exports = Forever;
