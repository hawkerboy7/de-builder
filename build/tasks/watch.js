// Node
var Watch, chokidar, fs, log, path;

fs = require("fs");

path = require("path");

// NPM
log = require("de-logger");

chokidar = require("chokidar");

Watch = class Watch {
  constructor(server) {
    this.watchSrc = this.watchSrc.bind(this);
    this.add = this.add.bind(this);
    this.change = this.change.bind(this);
    this.unlink = this.unlink.bind(this);
    // Catch error but do not do anything with it in case the file is not there for some reason
    this.ready = this.ready.bind(this);
    this.increase = this.increase.bind(this);
    this.server = server;
    this.listeners();
  }

  listeners() {
    this.server.vent.on("project:done", this.watchSrc);
    return this.server.vent.on("watch:increase", this.increase);
  }

  watchSrc() {
    // Count the files being added before the ready trigger
    this.init = false;
    this.count = {
      first: 0,
      second: 0
    };
    // Start watch
    log.info(`${this.server.config.title} - Watch`, "~ Night gathers, and now my watch begins ~");
    // Start the chokidar the file wachter
    return chokidar.watch(this.server.config.src, {
      ignored: /[\/\\]\./
    }).on("add", this.add).on("change", this.change).on("unlink", this.unlink).on("ready", this.ready);
  }

  add(file) {
    if (!this.init) {
      // Increase counter if not initialized
      this.count.first++;
    }
    // Add handler
    return this.addChange("Add", file);
  }

  change(file) {
    // Change handler
    return this.addChange("Change", file);
  }

  addChange(type, file) {
    var extention;
    // Notify
    log.debug(`${this.server.config.title} - Watch`, `${type}: ${file}`);
    // Get extention
    extention = path.extname(file);
    if (extention === ".less") {
      // Compile specific extentions
      return this.server.vent.emit("less:file", file, this.init);
    }
    if (extention === ".coffee") {
      return this.server.vent.emit("coffee:file", file, this.init);
    }
    // Copy file in case extention is not supported
    return this.server.vent.emit("copy:file", file, this.init);
  }

  unlink(file) {
    var remove, seperated;
    // Seperate path
    seperated = file.split(path.sep);
    // Remove first entry (src folder)
    seperated.shift();
    // File to remove in the build folder
    remove = this.server.config.build + path.sep + seperated.join(path.sep);
    // Notify
    log.info(`${this.server.config.title} - Watch`, `Unlink: ${remove}`);
    // Try to remove the file in the build folder
    return fs.unlink(this.server.root + path.sep + remove, function(e) {});
  }

  ready() {
    this.init = true;
    // Notify
    log.info(`${this.server.config.title} - Watch`, `Ready: ${this.count.first} files initially added`);
    // Watch has found all files
    return this.server.vent.emit("watch:init");
  }

  increase(count) {
    // Count init file builds (due to less it also accepts multiple counts)
    if (count) {
      this.count.second += count;
    } else {
      this.count.second++;
    }
    // Guard: Do not do anything until ready trigger is fired and counts are the same
    if (!(this.init && this.count.second === this.count.first)) {
      return;
    }
    // Watch has fully been initialized
    this.initialized = true;
    // Notify
    log.debug(`${this.server.config.title} - Watch`, `Ready: ${this.count.second} files have initially been created`);
    // Notify the initial addition of files trough watch has been finished
    return this.server.vent.emit("watch:initialized");
  }

};

module.exports = Watch;
