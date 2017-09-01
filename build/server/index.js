var EventEmitter, Server, cfg, extend, log, path, pkg;

path = require("path");

EventEmitter = require("events").EventEmitter;

log = require("de-logger");

extend = require("deep-extend");

cfg = require("./config");

pkg = require("../../package.json");

Server = (function() {
  function Server(config) {
    this.pkg = pkg;
    this.config = extend(cfg, config);
    this.config.title = "LDE";
    this.config.fullTitle = "Live Development Environment";
    process.title = this.pkg.name;
    this.env = process.argv[2] === "-prod" ? "production" : "development";
    log.set({
      debug: {
        display: this.config.debug
      }
    });
    log.info(this.config.title, this.config.fullTitle + " (" + this.config.title + ") started in: " + this.env);
    log.info(this.config.title, "Process title: " + this.pkg.name);
    this.load();
  }

  Server.prototype.load = function(cb) {
    this.symbols = {
      start: "•",
      finished: "✔"
    };
    this.root = path.resolve("./");
    this.myRoot = path.resolve(__dirname, "../../");
    this.vent = new EventEmitter;
    return this.toBuild = (function(_this) {
      return function(file) {
        var seperated;
        seperated = file.split(path.sep);
        seperated.shift();
        return _this.config.build + path.sep + seperated.join(path.sep);
      };
    })(this);
  };

  return Server;

})();

module.exports = Server;
