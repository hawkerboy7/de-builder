// Node
var Coffee, coffee, fs, log, path;

path = require("path");

// NPM
fs = require("fs-extra");

log = require("de-logger");

coffee = require("coffeescript");

Coffee = class Coffee {
  constructor(server) {
    this.process = this.process.bind(this);
    this.server = server;
    this.server.coffee = {
      process: this.process
    };
  }

  process(file) {
    return new Promise(async(resolve) => {
      var coffeeScript, data, destination, e, name;
      destination = this.server.toDestination(file).replace(".coffee", ".js");
      try {
        data = (await fs.readFile(this.server.root + path.sep + file, {
          encoding: "utf-8"
        }));
        await fs.mkdirp(path.dirname(destination));
      } catch (error) {
        e = error;
        log.error(`${this.server.config.title} - Coffee`, "read+mkdirp", e.stack);
        return resolve(true);
      }
      try {
        coffeeScript = coffee.compile(data, {
          bare: true
        });
      } catch (error) {
        e = error;
        coffeeScript = "";
        log.error(`${this.server.config.title} - Coffee`, file, `Line: ${e.location.first_line}`, e.message, e.code);
        return resolve(true);
      }
      try {
        await fs.writeFile(name = this.server.root + path.sep + destination, coffeeScript);
      } catch (error) {
        e = error;
        log.error(`${this.server.config.title} - Coffee`, "write", e.stack);
        return resolve(true);
      }
      log.info(`${this.server.config.title} - Coffee`, destination);
      return resolve();
    });
  }

};

module.exports = Coffee;
