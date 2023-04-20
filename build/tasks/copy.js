// Node
var Copy, fs, log, path;

path = require("path");

// NPM
fs = require("fs-extra");

log = require("de-logger");

Copy = class Copy {
  constructor(server) {
    this.process = this.process.bind(this);
    this.server = server;
    this.server.copy = {
      process: this.process
    };
  }

  process(file) {
    return new Promise(async(resolve) => {
      var destination, e, name, read, write;
      // Create path to destination
      destination = this.server.toDestination(file);
      // Create a read stream
      read = fs.createReadStream(this.server.root + path.sep + file);
      try {
        await fs.mkdirp(path.dirname(destination));
        write = fs.createWriteStream(name = this.server.root + path.sep + destination);
        write.on("finish", () => {
          log.info(`${this.server.config.title} - Copy`, `${destination}`);
          return resolve();
        });
        // Read file and write to destination
        return read.pipe(write);
      } catch (error) {
        e = error;
        return log.error(`${this.server.config.title} - Copy`, e.stack);
      }
    });
  }

};

module.exports = Copy;
