// NPM
var Clean, fs, log;

fs = require("fs-extra");

log = require("de-logger");

Clean = class Clean {
  constructor(server) {
    this.start = this.start.bind(this);
    this.server = server;
    this.listeners();
  }

  listeners() {
    return this.server.vent.on("builder:start", this.start);
  }

  start() {
    // Remove build folder
    return fs.remove(this.server.folders.build.index, () => {
      // Create build folder
      return fs.mkdirp(this.server.folders.build.index).then(() => {
        log.info("LDE - Clean", this.server.symbols.finished);
        // Notify application
        return this.server.vent.emit("clean:done");
      });
    });
  }

};

module.exports = Clean;
