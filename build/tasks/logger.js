// NPM
var Logger, log;

log = require("de-logger");

Logger = class Logger {
  constructor(server) {
    this.server = server;
    this.listeners();
  }

  listeners() {
    return this.server.vent.on("compiled:file", this.log);
  }

  log({title, message}) {
    return log.info(title, message);
  }

};

module.exports = Logger;
