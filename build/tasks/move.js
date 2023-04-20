// Node
var Move, fs, log, path;

path = require("path");

// NPM
fs = require("fs-extra");

log = require("de-logger");

Move = class Move {
  constructor(server) {
    this.process = this.process.bind(this);
    this.server = server;
    this.server.move = {
      process: this.process
    };
  }

  process() {
    return new Promise(async(resolve) => {
      var e;
      if (this.server.initialized) {
        return resolve(true);
      }
      try {
        await fs.move(this.server.folders.temp.index, this.server.folders.build.index, {
          overwrite: true
        });
      } catch (error) {
        e = error;
        log.error(`${this.server.config.title} - Move`, e.stack);
        log.error("Rebuild the project since to build folder is present right now");
        return resolve();
      }
      return resolve(true);
    });
  }

};

module.exports = Move;
