// Node
var Forever, log, nodemon, path;

path = require("path");

// NPM
log = require("de-logger");

nodemon = require("nodemon");

Forever = class Forever {
  constructor(server) {
    this.initialized = this.initialized.bind(this);
    this.forever = this.forever.bind(this);
    this.terminate = this.terminate.bind(this);
    this.server = server;
    if (this.server.config.forever.enabled && this.server.config.type !== 3) {
      this.listeners();
    }
  }

  listeners() {
    this.server.vent.on("terminate:child", this.terminate);
    this.server.vent.on("compiled:file", this.forever);
    return this.server.vent.on("watch:initialized", this.initialized);
  }

  initialized() {
    // Indicate that the application is initialized
    this.init = true;
    // Start forever
    return this.forever();
  }

  forever(args) {
    var build, file;
    if (!this.init) {
      return;
    }
    // Get file if it exists
    file = args != null ? args.file : void 0;
    if (!file) {
      return this.start();
    }
    build = this.server.folders.build.server;
    if (this.server.config.type === 2) {
      build = this.server.folders.build.index;
    }
    // Restart the server on any file change in the src
    if (-1 === file.indexOf(build)) {
      return;
    }
    return this.start();
  }

  start() {
    var entry, src;
    // Prevent running the script when
    if (!this.server.run) {
      return;
    }
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
    return nodemon.emit("quit");
  }

};

module.exports = Forever;
