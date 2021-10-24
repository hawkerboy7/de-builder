// Node
var Project, fs, log, path;

path = require("path");

// NPM
fs = require("fs-extra");

log = require("de-logger");

Project = class Project {
  constructor(server) {
    this.setup = this.setup.bind(this);
    this.handle = this.handle.bind(this);
    this.server = server;
    this.listeners();
  }

  listeners() {
    return this.server.vent.on("clean:done", this.setup);
  }

  setup() {
    this.i = 0;
    if (this.server.config.type === 1) {
      return this.typeOne();
    }
    return this.typeTwo();
  }

  typeOne() {
    fs.mkdirp(this.server.folders.src.client).then(this.handle);
    fs.mkdirp(this.server.folders.src.server).then(this.handle);
    fs.mkdirp(this.server.folders.build.client).then(this.handle);
    return fs.mkdirp(this.server.folders.build.server).then(this.handle);
  }

  typeTwo() {
    fs.mkdirp(this.server.folders.src.index).then(this.handle);
    return fs.mkdirp(this.server.folders.build.index).then(this.handle);
  }

  handle() {
    this.i++;
    if ((this.server.config.type === 1 && this.i === 4) || ((this.server.config.type === 2 || this.server.config.type === 3) && this.i === 2)) {
      // Notify project type
      log.info("LDE - Project", this.explaination());
      // Send event
      return this.server.vent.emit("project:done");
    }
  }

  explaination() {
    var message, type;
    type = this.server.config.type;
    message = "Project type \"";
    if (type === 1) {
      message += "Server-Client";
    }
    if (type === 2) {
      message += "Server";
    }
    if (type === 3) {
      message += "Client";
    }
    return message += "\" is used";
  }

};

module.exports = Project;
