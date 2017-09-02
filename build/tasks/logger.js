var Logger, log;

log = require("de-logger");

Logger = (function() {
  function Logger(server) {
    this.server = server;
    this.listeners();
  }

  Logger.prototype.listeners = function() {
    return this.server.vent.on("compiled:file", this.log);
  };

  Logger.prototype.log = function(arg) {
    var message, title;
    title = arg.title, message = arg.message;
    return log.info(title, message);
  };

  return Logger;

})();

module.exports = Logger;
