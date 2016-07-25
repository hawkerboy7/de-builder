var Exit, Manager, Server, SocketIO, Tasks, log;

log = require('de-logger');

Exit = require('./exit');

Tasks = require('./tasks');

Server = require('./server');

SocketIO = require('./socketIO');

Manager = (function() {
  function Manager(config) {
    var server;
    log.clear();
    server = new Server(config);
    new Exit(server);
    new SocketIO(server);
    new Tasks(server);
  }

  return Manager;

})();

module.exports = Manager;
