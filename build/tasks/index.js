// NPM
var BrowserSync, Browserify, Coffee, Copy, Forever, Less, Move, Project, Tasks, Watch, log;

log = require("de-logger");

// Modules
Copy = require("./copy");

Less = require("./less");

Move = require("./move");

Watch = require("./watch");

Coffee = require("./coffee");

Forever = require("./forever");

Project = require("./project");

Browserify = require("./browserify");

BrowserSync = require("./browser-sync");

Tasks = class Tasks {
  constructor(server) {
    this.server = server;
    this.load();
  }

  async load() {
    var a, b;
    log.info(`${this.server.config.title} - Tasks`, "Initialize phase");
    if (this.server.run) {
      // Only when running node build -prod do we need to create a temp folder
      this.server.initialized = true;
    }
    await new Project(this.server).init();
    new Copy(this.server);
    new Less(this.server);
    new Move(this.server);
    new Coffee(this.server);
    new Forever(this.server);
    await (new Browserify(this.server)).init();
    await (new BrowserSync(this.server)).init();
    await (new Watch(this.server)).init();
    a = this.server.less.process();
    b = this.server.browserify.process();
    await a;
    await b;
    if (!(await this.server.move.process())) {
      return;
    }
    if (!(this.server.run && this.server.config.type !== 3)) {
      return (await this.server.watch.close());
    }
    this.server.initialized = true;
    this.server.phaseOneDone = true;
    log.info(`${this.server.config.title} - Tasks`, "Running phase");
    if (this.server.config.forever.enabled) {
      return this.server.forever.run();
    }
  }

};

module.exports = Tasks;
