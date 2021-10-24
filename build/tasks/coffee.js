// Node
var Coffee, coffee, fs, log, notifier, path;

path = require("path");

// NPM
fs = require("fs-extra");

log = require("de-logger");

coffee = require("coffeescript");

notifier = require("node-notifier");

Coffee = class Coffee {
  constructor(server) {
    this.coffee = this.coffee.bind(this);
    this.server = server;
    this.listeners();
  }

  listeners() {
    return this.server.vent.on("coffee:file", this.coffee);
  }

  coffee(file, init) {
    var build;
    // Create destination path for compiled file
    build = this.server.toBuild(file).replace(".coffee", ".js");
    // Read coffee file
    return fs.readFile(this.server.root + path.sep + file, {
      encoding: "utf-8"
    }, (err, data) => {
      if (err) {
        this.notify(err.message);
        return log.error(err);
      }
      // Make sure path to destination exists
      return fs.mkdirp(path.dirname(build)).then(() => {
        var coffeeScript, e, msg, name;
        try {
          coffeeScript = coffee.compile(data, {
            bare: true
          });
        } catch (error) {
          e = error;
          coffeeScript = "";
          this.notify(msg = `${file}\nLine: ${e.location.first_line}\n${e.message}`);
          log.error(`${this.server.config.title} - Coffee`, `\n${msg}`, "\n", e.code);
        }
        // Write compiled coffee file to its destination
        return fs.writeFile(name = this.server.root + path.sep + build, coffeeScript, (err) => {
          if (err) {
            this.notify(err.message);
            return log.error(err);
          }
          this.server.vent.emit("compiled:file", {
            file: name,
            title: `${this.server.config.title} - Coffee`,
            message: `${build}`
          });
          if (!init) {
            // Notify the watch in case the init has not been triggered
            return this.server.vent.emit("watch:increase");
          }
        });
      });
    });
  }

  notify(message) {
    return notifier.notify({
      title: `${this.server.config.title} - Coffee`,
      message: message
    });
  }

};

module.exports = Coffee;
