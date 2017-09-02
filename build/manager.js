var Exit, Manager, Server, Tasks, log;

log = require("de-logger");

Exit = require("./exit");

Tasks = require("./tasks");

Server = require("./server");

Manager = (function() {
  function Manager(config) {
    var server;
    log.clear();
    server = new Server(config);
    new Exit(server);
    new Tasks(server);
  }

  return Manager;

})();

module.exports = Manager;
