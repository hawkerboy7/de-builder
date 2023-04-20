// Node
var Copy, fs, log, path;

path = require("path");

// NPM
fs = require("fs-extra");

log = require("de-logger");

Copy = class Copy {
  constructor(server) {
    this.copy = this.copy.bind(this);
    this.server = server;
    this.listeners();
  }

  listeners() {
    return this.server.vent.on("copy:file", this.copy);
  }

  copy(file, init) {
    var build, read;
    // Create path to destination
    build = this.server.toBuild(file);
    // Create a read stream
    read = fs.createReadStream(this.server.root + path.sep + file);
    // Ensure destination folders exist
    return fs.mkdirp(path.dirname(build)).then(() => {
      var name, write;
      // Create write stream
      write = fs.createWriteStream(name = this.server.root + path.sep + build);
      write.on("finish", () => {
        this.server.vent.emit("compiled:file", {
          file: name,
          title: `${this.server.config.title} - Copy`,
          message: `${build}`
        });
        if (!init) {
          // Notify the watch in case the init has not been triggered
          return this.server.vent.emit("watch:increase");
        }
      });
      // Read file and write to destination
      return read.pipe(write);
    });
  }

};

module.exports = Copy;
