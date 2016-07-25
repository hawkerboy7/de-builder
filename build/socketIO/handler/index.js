var Handler, log;

log = require('de-logger');

Handler = (function() {
  function Handler(arg) {
    this.socket = arg.socket, this.server = arg.server;
    log.event('LDE - Socket.io', "External connection has been made id: " + this.socket.id);
  }

  return Handler;

})();

module.exports = Handler;
