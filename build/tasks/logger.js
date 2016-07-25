var Logger, log,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

log = require('de-logger');

Logger = (function() {
  function Logger(server) {
    this.server = server;
    this.log = bind(this.log, this);
    this.listeners();
  }

  Logger.prototype.listeners = function() {
    return this.server.vent.on('compiled:file', this.log);
  };

  Logger.prototype.log = function(arg) {
    var file, message, title;
    title = arg.title, message = arg.message, file = arg.file;
    return log.info(title, message);
  };

  return Logger;

})();

module.exports = Logger;
