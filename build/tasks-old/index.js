// NPM
var BrowserSync, Browserify, Clean, Coffee, Copy, Forever, Less, Logger, Project, Tasks, Watch, path;

path = require("path");

// Modules
Copy = require("./copy");

Less = require("./less");

Clean = require("./clean");

Watch = require("./watch");

Coffee = require("./coffee");

Logger = require("./logger");

Forever = require("./forever");

Project = require("./project");

Browserify = require("./browserify");

BrowserSync = require("./browser-sync");

Tasks = class Tasks {
  constructor(server) {
    this.server = server;
    this.load();
  }

  load() {
    // Setup project folders
    this.folders();
    // Load all tasks
    new Copy(this.server);
    new Less(this.server);
    new Clean(this.server);
    new Watch(this.server);
    new Coffee(this.server);
    new Logger(this.server);
    new Forever(this.server);
    new Project(this.server);
    new Browserify(this.server);
    new BrowserSync(this.server);
    // Send the start command
    return this.server.vent.emit("builder:start");
  }

  folders() {
    var build, src, temp;
    return this.server.folders = {
      src: {
        index: src = `${this.server.root}${path.sep}${this.server.config.src}`,
        server: `${src}${path.sep}${this.server.config.server}`,
        client: `${src}${path.sep}${this.server.config.client}`
      },
      temp: {
        index: temp = `${this.server.root}${path.sep}${this.server.config.temp}`,
        server: `${temp}${path.sep}${this.server.config.server}`,
        client: `${temp}${path.sep}${this.server.config.client}`
      },
      build: {
        index: build = `${this.server.root}${path.sep}${this.server.config.temp}`,
        server: `${build}${path.sep}${this.server.config.server}`,
        client: `${build}${path.sep}${this.server.config.client}`
      }
    };
  }

};

module.exports = Tasks;
