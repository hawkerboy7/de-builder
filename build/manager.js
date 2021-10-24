// --------------------------------------------------
// Start Application
// --------------------------------------------------

// NPM
var Exit, Manager, Server, Tasks, log;

log = require("de-logger");

// Modules
Exit = require("./exit");

Tasks = require("./tasks");

Server = require("./server");

// --------------------------------------------------
// Application Manager | Starts all main processes
// --------------------------------------------------
Manager = class Manager {
  constructor(config) {
    var server;
    // Clear screen
    log.clear();
    // Initialize by creating a server the server
    server = new Server(config);
    // Handle program exit
    new Exit(server);
    // Startup all de-builder tasks
    new Tasks(server);
  }

};

module.exports = Manager;
